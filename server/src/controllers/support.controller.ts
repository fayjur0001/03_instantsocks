import { Request, Response } from "express";
import db from "@/db";
import { TicketModel, TicketMessageModel, TicketMessageSeenByModel } from "@/db/schema";
import UnloggingError from "@/utils/unlogging-error";
import pusher from "@/utils/pusher";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

export async function getMyTickets(req: Request, res: Response) {
  try {
    const tickets = await db.query.TicketModel.findMany({ where: (m, { eq }) => eq(m.userId, req.payload!.id), orderBy: (m, { desc }) => desc(m.updatedAt) });
    res.json({ success: true, tickets });
  } catch { res.status(500).json({ success: false, message: "Internal server error." }); }
}

export async function getOtherTickets(req: Request, res: Response) {
  try {
    const agentId = req.payload!.id;
    const tickets = await db.query.TicketModel.findMany({ where: (m, { eq }) => eq(m.agentId, agentId), orderBy: (m, { desc }) => desc(m.updatedAt) });
    res.json({ success: true, tickets });
  } catch { res.status(500).json({ success: false, message: "Internal server error." }); }
}

export async function getUnclaimedTickets(_req: Request, res: Response) {
  try {
    const tickets = await db.query.TicketModel.findMany({ where: (m, { isNull, and, eq }) => and(isNull(m.agentId), eq(m.status, "opened")), orderBy: (m, { desc }) => desc(m.updatedAt) });
    res.json({ success: true, tickets });
  } catch { res.status(500).json({ success: false, message: "Internal server error." }); }
}

export async function getTicket(req: Request, res: Response) {
  try {
    const ticketId = z.coerce.number().parse(req.params.ticketId);
    const ticket = await db.query.TicketModel.findFirst({ where: (m, { eq }) => eq(m.id, ticketId) });
    if (!ticket) { res.status(404).json({ success: false, message: "Ticket not found." }); return; }
    res.json({ success: true, ticket });
  } catch { res.status(500).json({ success: false, message: "Internal server error." }); }
}

export async function createTicket(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;
    const { subject, message, toUserId } = z.object({ subject: z.string().min(1), message: z.string().min(1), toUserId: z.number().optional() }).parse(req.body);
    const [ticket] = await db.insert(TicketModel).values({ userId, subject, agentId: toUserId }).returning();
    const [msg] = await db.insert(TicketMessageModel).values({ ticketId: ticket.id, userId, message }).returning();
    await db.insert(TicketMessageSeenByModel).values({ messageId: msg.id, userId });
    await pusher({ page: "/support/my-tickets", to: `user-${userId}` });
    res.json({ success: true, ticketId: ticket.id });
  } catch (e) {
    if (e instanceof UnloggingError) { res.status(400).json({ success: false, message: e.message }); return; }
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;
    const ticketId = z.coerce.number().parse(req.params.ticketId);
    const { message } = z.object({ message: z.string().min(1) }).parse(req.body);
    const ticket = await db.query.TicketModel.findFirst({ where: (m, { eq }) => eq(m.id, ticketId) });
    if (!ticket) { res.status(404).json({ success: false, message: "Ticket not found." }); return; }
    const [msg] = await db.insert(TicketMessageModel).values({ ticketId, userId, message }).returning();
    await db.insert(TicketMessageSeenByModel).values({ messageId: msg.id, userId });
    const page = `/support/${ticketId}`;
    await pusher({ page, to: `user-${ticket.userId}` });
    if (ticket.agentId && ticket.agentId !== ticket.userId) {
      await pusher({ page, to: `user-${ticket.agentId}` });
    }
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, message: "Internal server error." }); }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const ticketId = z.coerce.number().parse(req.params.ticketId);
    const messages = await db.query.TicketMessageModel.findMany({ where: (m, { eq }) => eq(m.ticketId, ticketId), orderBy: (m, { asc }) => asc(m.createdAt) });
    res.json({ success: true, messages });
  } catch { res.status(500).json({ success: false, message: "Internal server error." }); }
}

export async function closeTicket(req: Request, res: Response) {
  try {
    const ticketId = z.coerce.number().parse(req.params.ticketId);
    const ticket = await db.query.TicketModel.findFirst({ where: (m, { eq }) => eq(m.id, ticketId) });
    if (!ticket) { res.status(404).json({ success: false, message: "Ticket not found." }); return; }
    await db.update(TicketModel).set({ status: "closed" }).where(eq(TicketModel.id, ticketId));
    await pusher({ page: "/support/my-tickets", to: `user-${ticket.userId}` });
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, message: "Internal server error." }); }
}

export async function reopenTicket(req: Request, res: Response) {
  try {
    const ticketId = z.coerce.number().parse(req.params.ticketId);
    const ticket = await db.query.TicketModel.findFirst({ where: (m, { eq }) => eq(m.id, ticketId) });
    if (!ticket) { res.status(404).json({ success: false, message: "Ticket not found." }); return; }
    await db.update(TicketModel).set({ status: "opened" }).where(eq(TicketModel.id, ticketId));
    await pusher({ page: "/support/my-tickets", to: `user-${ticket.userId}` });
    if (ticket.agentId) {
      await pusher({ page: "/support/my-tickets", to: `user-${ticket.agentId}` });
    }
    res.json({ success: true });
  } catch { res.status(500).json({ success: false, message: "Internal server error." }); }
}

// Converted from: claim.action.ts
export async function claimTicket(req: Request, res: Response) {
  try {
    const agentId = req.payload!.id;
    const ticketId = z.coerce.number().int().min(1).parse(req.params.ticketId);
    const ticket = await db.query.TicketModel.findFirst({
      where: (m, { eq, and, isNull }) => and(eq(m.id, ticketId), isNull(m.agentId), eq(m.status, "opened")),
      columns: { userId: true },
    });
    if (!ticket) throw new UnloggingError("Ticket not found.");
    await db.update(TicketModel).set({ agentId }).where(eq(TicketModel.id, ticketId));
    await pusher({ page: "/support/unclaimed-tickets", to: "staff" });
    await pusher({ page: "/support/my-tickets", to: `user-${ticket.userId}` });
    await pusher({ page: "/support/my-tickets", to: `user-${agentId}` });
    await pusher({ page: "/support/other-tickets", to: "admin" });
    res.json({ success: true });
  } catch (e) {
    if (e instanceof UnloggingError) { res.status(400).json({ success: false, message: e.message }); return; }
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}
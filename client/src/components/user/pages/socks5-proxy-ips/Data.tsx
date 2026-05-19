import { Country, ProxyItem, Region } from "@/types/user/socks5-proxy-ips";

export const REGIONS: Region[] = [
  { id: "usa", label: "USA", count: 21907 },
  { id: "america", label: "America", count: 4173 },
  { id: "europe", label: "Europe", count: 15382 },
  { id: "oceania", label: "AU, Oceania", count: 1445 },
  { id: "asia", label: "Asia", count: 4454 },
  { id: "africa", label: "Africa", count: 620 },
];

export const COUNTRIES: Country[] = [
  // USA — single entry, no sub-country selection
  { code: "US", name: "All USA", count: 21907, regionId: "usa" },
  // America
  { code: "AG", name: "Antigua", count: 8, regionId: "america" },
  { code: "AR", name: "Argentina", count: 91, regionId: "america" },
  { code: "AW", name: "Aruba", count: 8, regionId: "america" },
  { code: "BS", name: "Bahamas", count: 29, regionId: "america" },
  { code: "BB", name: "Barbados", count: 20, regionId: "america" },
  { code: "BR", name: "Brazil", count: 415, regionId: "america" },
  { code: "CA", name: "Canada", count: 2758, regionId: "america" },
  { code: "CL", name: "Chile", count: 39, regionId: "america" },
  { code: "CO", name: "Colombia", count: 61, regionId: "america" },
  { code: "MX", name: "Mexico", count: 236, regionId: "america" },
  { code: "PE", name: "Peru", count: 33, regionId: "america" },
  { code: "VE", name: "Venezuela", count: 39, regionId: "america" },
  // Europe
  { code: "GB", name: "United Kingdom", count: 1842, regionId: "europe" },
  { code: "DE", name: "Germany", count: 2103, regionId: "europe" },
  { code: "FR", name: "France", count: 1567, regionId: "europe" },
  { code: "NL", name: "Netherlands", count: 891, regionId: "europe" },
  { code: "PL", name: "Poland", count: 445, regionId: "europe" },
  { code: "ES", name: "Spain", count: 523, regionId: "europe" },
  { code: "IT", name: "Italy", count: 612, regionId: "europe" },
  { code: "SE", name: "Sweden", count: 287, regionId: "europe" },
  { code: "UA", name: "Ukraine", count: 334, regionId: "europe" },
  // Asia
  { code: "JP", name: "Japan", count: 892, regionId: "asia" },
  { code: "CN", name: "China", count: 1245, regionId: "asia" },
  { code: "IN", name: "India", count: 567, regionId: "asia" },
  { code: "KR", name: "South Korea", count: 423, regionId: "asia" },
  { code: "SG", name: "Singapore", count: 312, regionId: "asia" },
  { code: "TH", name: "Thailand", count: 189, regionId: "asia" },
  { code: "HK", name: "Hong Kong", count: 234, regionId: "asia" },
  // Oceania
  { code: "AU", name: "Australia", count: 1102, regionId: "oceania" },
  { code: "NZ", name: "New Zealand", count: 245, regionId: "oceania" },
  { code: "FJ", name: "Fiji", count: 28, regionId: "oceania" },
  // Africa
  { code: "ZA", name: "South Africa", count: 189, regionId: "africa" },
  { code: "NG", name: "Nigeria", count: 145, regionId: "africa" },
  { code: "KE", name: "Kenya", count: 87, regionId: "africa" },
  { code: "EG", name: "Egypt", count: 112, regionId: "africa" },
  { code: "GH", name: "Ghana", count: 67, regionId: "africa" },
];

export const MOCK_PROXIES: ProxyItem[] = [
    // Antigua (AG)
    { id: "p1", ip: "104.255.*.*", domain: "104.255.*.*", country: "Antigua", countryCode: "AG", state: "04", city: "St John's", isp: "Digicel", zip: "-", speed: "4.4M", ping: 485, type: "ISP/MOB", added: "Today", price: 1.40, org: "Digicel", zone: "America/Antigua", dns: "172.253.209.148", blacklisted: false, usage: "No users", connectionString: "216.22.49.36:47349" },
    { id: "p2", ip: "38.2.*.*", domain: "38.2.*.*", country: "Antigua", countryCode: "AG", state: "04", city: "St John's", isp: "APUA", zip: "-", speed: "271K", ping: 460, type: "ISP", added: "7 days ago", price: 1.12, org: "APUA", zone: "America/Antigua", dns: "8.8.8.8", blacklisted: false, usage: "No users", connectionString: "216.22.49.37:47349" },
    { id: "p3", ip: "216.48.*.*", domain: "216.48.*.*", country: "Antigua", countryCode: "AG", state: "04", city: "St John's", isp: "APUA", zip: "-", speed: "1.3M", ping: 555, type: "ISP/MOB", added: "Today", price: 1.40, org: "APUA", zone: "America/Antigua", dns: "8.8.4.4", blacklisted: false, usage: "No users", connectionString: "216.22.49.38:47349" },
    { id: "p4", ip: "209.59.*.*", domain: "209.59.*.*", country: "Antigua", countryCode: "AG", state: "04", city: "Saint John's", isp: "Cable & Wireless", zip: "-", speed: "1.4M", ping: 454, type: "ISP/MOB", added: "Yesterday", price: 1.12, org: "Cable & Wireless", zone: "America/Antigua", dns: "1.1.1.1", blacklisted: false, usage: "No users", connectionString: "216.22.49.39:47349" },
    { id: "p5", ip: "38.3.*.*", domain: "38.3.*.*", country: "Antigua", countryCode: "AG", state: "04", city: "St John's", isp: "APUA", zip: "-", speed: "496K", ping: 369, type: "ISP", added: "Yesterday", price: 1.12, org: "APUA", zone: "America/Antigua", dns: "8.8.8.8", blacklisted: false, usage: "No users", connectionString: "216.22.49.40:47349" },
    // USA (US)
    { id: "p6", ip: "73.187.*.*", domain: "c-73-187.comcast.net", country: "United States", countryCode: "US", state: "PA", city: "Lebanon", isp: "Comcast Cable", zip: "17046", speed: "3.35M", ping: 52, type: "ISP", added: "40 days ago", price: 2.48, org: "Comcast Cable", zone: "America/New_York", dns: "69.252.71.237", blacklisted: false, usage: "No users", connectionString: "kz3zay1:1hb52me@216.22.49.36:47349" },
    { id: "p7", ip: "104.129.*.*", domain: "mob-104.att.net", country: "United States", countryCode: "US", state: "TX", city: "Austin", isp: "AT&T Mobility", zip: "73301", speed: "8.12M", ping: 21, type: "MOB", added: "11 days ago", price: 3.10, org: "AT&T", zone: "America/Chicago", dns: "8.8.8.8", blacklisted: false, usage: "No users", connectionString: "tx4abc:pass123@104.129.52.14:8080" },
    { id: "p8", ip: "192.168.*.*", domain: "la.gov", country: "United States", countryCode: "US", state: "CA", city: "Los Angeles", isp: "AT&T", zip: "90001", speed: "5.00M", ping: 30, type: "GOV", added: "7 days ago", price: 4.00, org: "LA City Gov", zone: "America/Los_Angeles", dns: "4.2.2.2", blacklisted: false, usage: "No users", connectionString: "gov1:govpass@192.168.10.5:1080" },
    { id: "p9", ip: "98.114.*.*", domain: "verizon.net", country: "United States", countryCode: "US", state: "NY", city: "New York", isp: "Verizon", zip: "10001", speed: "6.20M", ping: 18, type: "ISP", added: "3 days ago", price: 2.80, org: "Verizon Comm.", zone: "America/New_York", dns: "4.2.2.1", blacklisted: false, usage: "No users", connectionString: "ny1:nypass@98.114.1.1:8080" },
    // United Kingdom (GB)
    { id: "p10", ip: "45.155.*.*", domain: "lon-45.bt.net", country: "United Kingdom", countryCode: "GB", state: "ENG", city: "London", isp: "British Telecom", zip: "EC1A", speed: "2.40M", ping: 68, type: "ISP", added: "23 days ago", price: 2.75, org: "BT Group", zone: "Europe/London", dns: "8.8.4.4", blacklisted: false, usage: "No users", connectionString: "gbuser:gbpass@45.155.68.89:3128" },
    // Germany (DE)
    { id: "p11", ip: "185.220.*.*", domain: "hetzner.de", country: "Germany", countryCode: "DE", state: "BE", city: "Berlin", isp: "Hetzner Online", zip: "10115", speed: "1.02M", ping: 120, type: "DCH", added: "57 days ago", price: 1.95, org: "Hetzner Online", zone: "Europe/Berlin", dns: "1.1.1.1", blacklisted: false, usage: "No users", connectionString: "de1:de1pass@185.220.101.45:9050" },
    // France (FR)
    { id: "p12", ip: "51.159.*.*", domain: "scaleway.com", country: "France", countryCode: "FR", state: "IDF", city: "Paris", isp: "Online SAS", zip: "75001", speed: "6.70M", ping: 45, type: "SES", added: "4 days ago", price: 3.30, org: "Scaleway", zone: "Europe/Paris", dns: "80.67.169.12", blacklisted: false, usage: "No users", connectionString: "frses:frpass@51.159.44.77:5050" },
    // Netherlands (NL)
    { id: "p13", ip: "77.68.*.*", domain: "xs4all.nl", country: "Netherlands", countryCode: "NL", state: "NH", city: "Amsterdam", isp: "XS4ALL", zip: "1012", speed: "4.10M", ping: 88, type: "COM", added: "91 days ago", price: 2.20, org: "XS4ALL", zone: "Europe/Amsterdam", dns: "9.9.9.9", blacklisted: false, usage: "No users", connectionString: "nl1:nl1pass@77.68.11.23:8888" },
    // Japan (JP)
    { id: "p14", ip: "203.78.*.*", domain: "ntt.net", country: "Japan", countryCode: "JP", state: "TK", city: "Tokyo", isp: "NTT Communications", zip: "100-0001", speed: "12.00M", ping: 15, type: "ISP/MOB", added: "15 days ago", price: 5.50, org: "NTT Communications", zone: "Asia/Tokyo", dns: "103.2.57.5", blacklisted: false, usage: "No users", connectionString: "jpvip:jppass@203.78.145.200:10800" },
    // Singapore (SG)
    { id: "p15", ip: "103.86.*.*", domain: "singtel.com", country: "Singapore", countryCode: "SG", state: "SG", city: "Singapore", isp: "Singtel", zip: "018989", speed: "9.20M", ping: 22, type: "ISP", added: "3 days ago", price: 4.10, org: "Singtel", zone: "Asia/Singapore", dns: "202.166.120.204", blacklisted: false, usage: "No users", connectionString: "sg1:sgpass@103.86.1.1:1080" },
    // Australia (AU)
    { id: "p16", ip: "1.145.*.*", domain: "telstra.net", country: "Australia", countryCode: "AU", state: "NSW", city: "Sydney", isp: "Telstra", zip: "2000", speed: "5.80M", ping: 35, type: "ISP", added: "8 days ago", price: 3.75, org: "Telstra", zone: "Australia/Sydney", dns: "203.0.113.1", blacklisted: false, usage: "No users", connectionString: "au1:aupass@1.145.1.1:3128" },
    // South Africa (ZA)
    { id: "p17", ip: "196.216.*.*", domain: "mtn.co.za", country: "South Africa", countryCode: "ZA", state: "GP", city: "Johannesburg", isp: "MTN SA", zip: "2000", speed: "2.10M", ping: 145, type: "MOB", added: "12 days ago", price: 1.80, org: "MTN SA", zone: "Africa/Johannesburg", dns: "196.43.2.1", blacklisted: false, usage: "No users", connectionString: "za1:zapass@196.216.1.1:8080" },
    // Brazil (BR)
    { id: "p18", ip: "189.40.*.*", domain: "vivo.com.br", country: "Brazil", countryCode: "BR", state: "SP", city: "São Paulo", isp: "Vivo", zip: "01310", speed: "7.50M", ping: 110, type: "ISP", added: "5 days ago", price: 2.35, org: "Telefonica Brasil", zone: "America/Sao_Paulo", dns: "189.40.64.1", blacklisted: false, usage: "No users", connectionString: "br1:brpass@189.40.1.1:3128" },
    // Canada (CA)
    { id: "p19", ip: "70.28.*.*", domain: "rogers.net", country: "Canada", countryCode: "CA", state: "ON", city: "Toronto", isp: "Rogers Cable", zip: "M5V", speed: "4.90M", ping: 38, type: "ISP", added: "18 days ago", price: 2.90, org: "Rogers Communications", zone: "America/Toronto", dns: "70.28.0.1", blacklisted: false, usage: "No users", connectionString: "ca1:capass@70.28.1.1:8080" },
    // Argentina (AR)
    { id: "p20", ip: "200.35.*.*", domain: "telefonica.net.ar", country: "Argentina", countryCode: "AR", state: "BA", city: "Buenos Aires", isp: "Telefonica Argentina", zip: "1000", speed: "3.20M", ping: 195, type: "ISP", added: "22 days ago", price: 2.05, org: "Telefonica", zone: "America/Argentina/Buenos_Aires", dns: "200.51.209.1", blacklisted: false, usage: "No users", connectionString: "ar1:arpass@200.35.1.1:3128" },
];
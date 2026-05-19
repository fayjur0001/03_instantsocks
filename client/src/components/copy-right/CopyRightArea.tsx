const CopyRightArea = () => {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-1 text-center text-c-gray-400 text-sm py-3 absolute bottom-0 left-1/2 transform -translate-x-1/2">
      <p className="text-center text-white/30">© Present, InstantSocks.</p>
      <p className="flex items-center gap-1">
        <a
          href="https://instantsocks.com/terms-conditions/"
          className="text-green/60 hover:underline"
        >
          Terms & Conditions
        </a>
        <span className="text-white/50 mx-1 text-[8px]">|</span>
        <a
          href="https://instantsocks.com/privacy-policy/"
          className="text-green/60 hover:underline"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default CopyRightArea;

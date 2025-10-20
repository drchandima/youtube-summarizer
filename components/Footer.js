export default function Footer() {
  return (
    <footer className="bg-[#0F0F0F] border-t border-white/10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-xl font-bold">
              <span className="text-[#FF0000]">YT</span>
              <span className="text-white">Summarizer</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm">Powered by AI • Built for Creators</p>
          <p className="text-gray-600 text-sm mt-2">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-digiclick-dark text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-digiclick-darker/95 backdrop-blur-md border-b border-digiclick-blue/10 px-8 py-4 z-50">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-2xl font-bold bg-gradient-to-r from-digiclick-blue to-digiclick-purple bg-clip-text text-transparent">
            DigiClick AI
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-digiclick-blue hover:text-white transition-colors">Home</a>
            <a href="/about" className="text-gray-300 hover:text-white transition-colors">About</a>
            <a href="/services" className="text-gray-300 hover:text-white transition-colors">Services</a>
            <a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            <a 
              href="/contact" 
              className="bg-gradient-to-r from-digiclick-blue to-digiclick-purple text-white px-6 py-3 rounded-full font-semibold hover:shadow-glow transition-all"
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 text-center bg-gradient-to-br from-digiclick-blue/10 to-digiclick-purple/10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-digiclick-blue to-digiclick-purple bg-clip-text text-transparent">
            Transform Your Business with AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Leverage AI-driven web design and automation to create seamless, futuristic digital experiences that drive results and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/services" 
              className="bg-gradient-to-r from-digiclick-blue to-digiclick-purple text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-glow-lg transition-all"
            >
              Explore Services
            </a>
            <a 
              href="/contact" 
              className="border-2 border-digiclick-blue text-digiclick-blue px-8 py-4 rounded-full font-semibold text-lg hover:bg-digiclick-blue hover:text-white transition-all"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-digiclick-blue to-digiclick-purple bg-clip-text text-transparent">
            Our Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-digiclick-darker p-8 rounded-2xl border border-digiclick-blue/20 hover:border-digiclick-blue/50 transition-all">
              <h3 className="text-2xl font-bold mb-4 text-digiclick-blue">AI Web Development</h3>
              <p className="text-gray-300">Custom websites powered by artificial intelligence for enhanced user experiences.</p>
            </div>
            <div className="bg-digiclick-darker p-8 rounded-2xl border border-digiclick-purple/20 hover:border-digiclick-purple/50 transition-all">
              <h3 className="text-2xl font-bold mb-4 text-digiclick-purple">Digital Marketing</h3>
              <p className="text-gray-300">AI-driven marketing strategies that maximize your digital presence and ROI.</p>
            </div>
            <div className="bg-digiclick-darker p-8 rounded-2xl border border-digiclick-blue/20 hover:border-digiclick-blue/50 transition-all">
              <h3 className="text-2xl font-bold mb-4 text-digiclick-blue">Automation Solutions</h3>
              <p className="text-gray-300">Streamline your business processes with intelligent automation systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-digiclick-darker border-t border-digiclick-blue/10 py-12 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-digiclick-blue to-digiclick-purple bg-clip-text text-transparent">
            DigiClick AI
          </div>
          <p className="text-gray-400 mb-6">Transform your digital presence with AI-powered solutions</p>
          <div className="flex justify-center space-x-6">
            <a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a>
            <a href="/services" className="text-gray-400 hover:text-white transition-colors">Services</a>
            <a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-gray-500">
            <p>&copy; 2024 DigiClick AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

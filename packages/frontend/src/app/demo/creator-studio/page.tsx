'use client';

import Link from 'next/link';

export default function CreatorStudioDemo() {
  const projects = [
    { title: 'E-Commerce Redesign', type: 'Web Design', year: '2026' },
    { title: 'Brand Identity System', type: 'Branding', year: '2026' },
    { title: 'Mobile App UI', type: 'Product Design', year: '2025' },
    { title: 'SaaS Dashboard', type: 'Web App', year: '2025' },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Demo Badge */}
      <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-pink-500 text-white text-sm font-bold rounded-full shadow-lg">
        DEMO SITE
      </div>

      {/* Back Button */}
      <Link
        href="/#portfolio"
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-black/10 backdrop-blur text-black text-sm font-medium rounded-lg hover:bg-black/20 transition"
      >
        ← Back to Portfolio
      </Link>

      {/* Navigation */}
      <nav className="pt-20 pb-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="text-2xl font-black">Jordan Mills</div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#work" className="hover:text-pink-500 transition">
              Work
            </a>
            <a href="#about" className="hover:text-pink-500 transition">
              About
            </a>
            <a href="#contact" className="hover:text-pink-500 transition">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none">
              Full-Stack Developer & Content Creator
            </h1>
            <p className="text-2xl text-gray-600 mb-12 leading-relaxed">
              I build beautiful digital experiences and share what I learn along the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-pink-500 text-white font-bold text-lg rounded-lg hover:bg-pink-600 transition">
                View My Work
              </button>
              <button className="px-8 py-4 border-2 border-black text-black font-bold text-lg rounded-lg hover:bg-black hover:text-white transition">
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Bento Grid */}
      <section id="work" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-12">Selected Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, idx) => (
              <div
                key={project.title}
                className={`group relative rounded-2xl border-2 border-black overflow-hidden hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 ${
                  idx === 0 ? 'md:col-span-2' : ''
                }`}
              >
                {/* Project Image Placeholder */}
                <div
                  className={`${
                    idx === 0 ? 'aspect-[2/1]' : 'aspect-square'
                  } bg-gradient-to-br from-pink-100 to-orange-100 group-hover:from-pink-200 group-hover:to-orange-200 transition-all duration-300`}
                ></div>
                <div className="p-6 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500">{project.type}</span>
                    <span className="text-xs text-gray-400">{project.year}</span>
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-pink-500 transition">
                    {project.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500"></div>
            </div>
            <div>
              <h2 className="text-4xl font-black mb-6">About Me</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                I'm a full-stack developer based in Austin, TX. I specialize in building modern web
                applications with React, Next.js, and Node.js.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                When I'm not coding, I create content about web development, share open-source
                projects, and help other developers level up their skills.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind', 'PostgreSQL'].map(
                      (skill) => (
                        <span
                          key={skill}
                          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">Join My Newsletter</h2>
          <p className="text-xl text-gray-300 mb-8">
            Weekly insights on web development, design, and building digital products
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
            />
            <button className="px-8 py-4 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Join 5,000+ developers. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-5xl font-black mb-6">Let's Work Together</h2>
            <p className="text-xl text-gray-600 mb-8">
              Available for freelance projects, consulting, and content collaborations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="mailto:hello@jordanmills.com"
                className="px-8 py-4 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition"
              >
                Email Me
              </a>
              <a
                href="#"
                className="px-8 py-4 border-2 border-black text-black font-bold rounded-lg hover:bg-black hover:text-white transition"
              >
                View Resume
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm">
              <a href="#" className="hover:text-pink-500 transition font-medium">
                Twitter
              </a>
              <a href="#" className="hover:text-pink-500 transition font-medium">
                GitHub
              </a>
              <a href="#" className="hover:text-pink-500 transition font-medium">
                LinkedIn
              </a>
              <a href="#" className="hover:text-pink-500 transition font-medium">
                YouTube
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm mb-4">
            This is a demo website created by Soft Systems Studio
          </p>
          <Link
            href="/#web-design"
            className="inline-block px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
          >
            Want a site like this? Get a quote →
          </Link>
        </div>
      </footer>
    </div>
  );
}

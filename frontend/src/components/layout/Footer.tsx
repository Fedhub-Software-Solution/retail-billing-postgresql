const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex-shrink-0 relative z-10">
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side - Copyright */}
        <div className="text-sm text-gray-600">
          Powered by © 2025 Fedhub Software. All rights reserved.
        </div>

        {/* Right Side - Links */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
            onClick={(e) => {
              e.preventDefault()
              // Add Terms page navigation or modal
            }}
          >
            Terms
          </a>
          <a
            href="#"
            className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
            onClick={(e) => {
              e.preventDefault()
              // Add Privacy Policy page navigation or modal
            }}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer


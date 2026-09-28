export default function Footer() {
  return (
    // pb-16 on mobile gives clearance for the fixed BottomTabBar (~56px + safe area)
    <footer className="border-t bg-gray-50 py-2 pb-16 sm:pb-2 text-center text-gray-400" style={{ fontSize: '9px', fontWeight: 300 }}>
      <p>
        Developed by{' '}
        <a
          href="https://neurasphere.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-light text-gray-400 hover:text-gray-500 transition-colors"
        >
          Neurasphere AI LLP
        </a>
        {' | '}
        <a
          href="https://neurasphere.in/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="font-light text-gray-400 hover:text-gray-500 transition-colors"
        >
          Contact
        </a>
      </p>
    </footer>
  )
}

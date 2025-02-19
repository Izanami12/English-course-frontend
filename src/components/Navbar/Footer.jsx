const Footer = () => {
    return (
      <footer className="bg-blue-600 text-white py-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-lg">&copy; {new Date().getFullYear()} English Wheelchair Club App. All rights reserved.</p>
          <p className="text-base mt-1">Built with React & ❤️</p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  
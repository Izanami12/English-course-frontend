const Footer = () => {
  return (
    <footer className="bg-black text-white py-2 text-sm w-full">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} English Wheelchair Club App. All rights reserved.</p>
        <p className="mt-1">Built with React & ❤️</p>
      </div>
    </footer>
  );
};

export default Footer;

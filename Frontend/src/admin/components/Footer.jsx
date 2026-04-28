const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow mt-auto">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Yeshigabcha — All Rights Reserved
          </p>
          <div className="flex mt-4 md:mt-0">
            <a href="#" className="mx-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              Terms
            </a>
            <a href="#" className="mx-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              Privacy
            </a>
            <a href="#" className="mx-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
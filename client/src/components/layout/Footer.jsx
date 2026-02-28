import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-dark">LUXESCENT</h3>
            <p className="mt-2 text-sm text-slate">
              Premium perfumes for every occasion. Discover your signature scent.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-dark">Quick Links</h4>
            <nav className="mt-2 flex flex-col gap-1">
              <Link to="/" className="text-sm text-slate hover:text-lilac">Home</Link>
              <Link to="/?category=men" className="text-sm text-slate hover:text-lilac">Men</Link>
              <Link to="/?category=women" className="text-sm text-slate hover:text-lilac">Women</Link>
              <Link to="/?category=unisex" className="text-sm text-slate hover:text-lilac">Unisex</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-semibold text-dark">Contact</h4>
            <div className="mt-2 space-y-1 text-sm text-slate">
              <p>support@luxescent.com</p>
              <p>+91 98765 43210</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-center text-sm text-slate">
          &copy; {new Date().getFullYear()} Luxescent. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

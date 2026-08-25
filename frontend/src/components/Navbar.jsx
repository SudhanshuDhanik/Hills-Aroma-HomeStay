import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { homestay } from '../content/homestay'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/location', label: 'Location & Nearby' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-sand-50/95 backdrop-blur border-b border-brand-100">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-display font-semibold text-brand-800">
          {homestay.logo && <img src={homestay.logo} alt={homestay.name} className="h-8 w-8 object-contain" />}
          {homestay.name}
        </Link>

        <button
          className="md:hidden p-2 text-brand-800"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>

        <ul className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium hover:text-brand-600 transition-colors ${isActive ? 'text-brand-700' : 'text-brand-800'}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {open && (
        <ul className="md:hidden flex flex-col gap-1 px-4 pb-4">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => setOpen(false)}
                className="block py-2 text-brand-800 font-medium"
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

// import { useState } from 'react'
// import { Link, NavLink } from 'react-router-dom'
// import { homestay } from '../content/homestay'

// const links = [
//   { to: '/', label: 'Home' },
//   { to: '/about', label: 'About' },
//   { to: '/rooms', label: 'Rooms' },
//   { to: '/gallery', label: 'Gallery' },
//   { to: '/location', label: 'Location & Nearby' },
//   { to: '/contact', label: 'Contact' },
// ]

// export default function Navbar() {
//   const [open, setOpen] = useState(false)

//   return (
//    <header className="sticky top-0 z-50 bg-sand-50 border-b border-brand-100">

//       <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
       

//           {/* Logo / Brand */}
//           <Link
//             to="/"
//             onClick={() => setOpen(false)}
//             className="flex items-center gap-3 group"
//           >
//            {homestay.logo && (
//   <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden border-2 border-brand-200 shadow-sm">
//     <img
//       src={homestay.logo}
//       alt={`${homestay.name} logo`}
//       className="h-full w-full object-cover"
//     />
//   </div>
// )}

//             <div className="leading-tight">
//               <span className="block text-lg md:text-xl font-display font-semibold text-brand-800 group-hover:text-brand-700 transition-colors">
//                 {homestay.name}
//               </span>

//               <span className="hidden sm:block text-[11px] text-brand-500 tracking-wide">
//                 A peaceful stay in Kumaon
//               </span>
//             </div>
//           </Link>

//           {/* Desktop Navigation */}
//           <ul className="hidden md:flex items-center gap-1">
//             {links.map((link) => (
//               <li key={link.to}>
//                 <NavLink
//                   to={link.to}
//                   className={({ isActive }) =>
//                     `
//                     relative px-3 py-2 rounded-full text-sm font-medium
//                     transition-all duration-200
//                     ${
//                       isActive
//                         ? 'bg-brand-100 text-brand-800'
//                         : 'text-brand-700 hover:bg-brand-50 hover:text-brand-800'
//                     }
//                     `
//                   }
//                 >
//                   {link.label}
//                 </NavLink>
//               </li>
//             ))}

            
//           </ul>

//           {/* Mobile Menu Button */}
//           <button
//             type="button"
//             className="md:hidden h-10 w-10 flex items-center justify-center rounded-full text-brand-800 hover:bg-brand-100 transition-colors"
//             onClick={() => setOpen(!open)}
//             aria-label={open ? 'Close menu' : 'Open menu'}
//             aria-expanded={open}
//           >
//             <span className="text-xl">
//               {open ? '✕' : '☰'}
//             </span>
//           </button>
     

//         {/* Mobile Navigation */}
//         {open && (
//           <div className="md:hidden border-t border-brand-100 py-3">
//             <ul className="flex flex-col gap-1">
//               {links.map((link) => (
//                 <li key={link.to}>
//                   <NavLink
//                     to={link.to}
//                     onClick={() => setOpen(false)}
//                     className={({ isActive }) =>
//                       `
//                       block px-4 py-3 rounded-xl text-sm font-medium
//                       transition-colors
//                       ${
//                         isActive
//                           ? 'bg-brand-100 text-brand-800'
//                           : 'text-brand-700 hover:bg-brand-50'
//                       }
//                       `
//                     }
//                   >
//                     {link.label}
//                   </NavLink>
//                 </li>
//               ))}

//               {/* Mobile CTA */}
//               {/* <li className="pt-2">
//                 <Link
//                   to="/contact"
//                   onClick={() => setOpen(false)}
//                   className="block text-center bg-brand-700 hover:bg-brand-800 text-white font-medium px-5 py-3 rounded-full transition-colors"
//                 >
//                   Enquire Now
//                 </Link>
//               </li> */}
//             </ul>
//           </div>
//         )}
//       </nav>
//     </header>
//   )
// }


import { HugeiconsIcon } from "@hugeicons/react"
import { Facebook01Icon, GlobeIcon, InstagramIcon } from "@hugeicons/core-free-icons"

// 🎮 Press Up, Up, Down, Down, Left, Right, Left, Right, B, A to unlock the secret level
export function Footer() {
  return (
      <footer className="p-4 text-center text-[#BABABA] mt-auto py-12 bg-black">
      <div className="flex justify-center space-x-2 mb-2">
        <a href="https://ymfgakl.com" target="_blank" rel="noopener noreferrer" className="text-[#BABABA] hover:text-white">
          <HugeiconsIcon icon={GlobeIcon} size={20} />
        </a>
        <a href="https://www.instagram.com/ymfgakl" target="_blank" rel="noopener noreferrer" className="text-[#BABABA] hover:text-white">
          <HugeiconsIcon icon={InstagramIcon} size={20} />
        </a>
        <a href="https://www.facebook.com/ymfgakl" target="_blank" rel="noopener noreferrer" className="text-[#BABABA] hover:text-white">
          <HugeiconsIcon icon={Facebook01Icon} size={20} />
        </a>
      </div>
      <p className="text-sm">A HIGHSCHOOL EVENT BY @YMFGAKL</p>
    </footer>
  )
} 
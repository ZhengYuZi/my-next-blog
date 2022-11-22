import Image from "next/image"
import LOGO from "../assets/images/logo.png"
import Link from "next/link"

const tabs = [
  {
    text: "Home",
    link: "/",
  },
  {
    text: "Blog",
    link: "/blog",
  },
]

const Header: React.FC = () => {
  return (
    <div className="h-16 sticky top-0 bg-white border-b border-solid border-gray-200">
      <div className="w-11/12 max-w-960px h-full flex justify-between items-center mx-auto">
        <div>
          <Image src={LOGO} alt="logo" width={36} height={36} priority></Image>
        </div>
        <ul className="flex space-x-4 text-sm text-gray-600">
          {tabs?.map((item) => {
            return (
              <li className="hover:text-blue-600" key={item.text}>
                <Link href={item.link}>{item.text}</Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default Header

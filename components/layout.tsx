import Header from "./header"
import Footer from "./footer"

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <main className="w-11/12 max-w-960px mx-auto">{children}</main>
      {/* <Footer /> */}
    </>
  )
}

export default Layout
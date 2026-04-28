import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
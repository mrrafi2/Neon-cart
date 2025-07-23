import Footer from "./footer";
import Header from "./header";

export default function Layout ({children} ) {

    return ( 
        <>
        <Header/>
        <br />
        
        <div className="container-fluid ">
             {children}
        </div>
        <Footer/>
        </>
    )
}
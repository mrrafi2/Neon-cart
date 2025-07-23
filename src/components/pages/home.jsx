import Products from "../productRelated/products";

export default function Home () {

    return (
        <div className="mt-5" style={{minHeight:"100vh"}}>
          <Products/>
          <br />
          <br />
          <hr  style={{backgroundColor:"cyan", height:'2px'}}/>
          <br />
        </div>
    )
}
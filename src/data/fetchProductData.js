//  fetches all products from Firebase 

import { getDatabase, ref, get } from "firebase/database";

export async function fetchProducts( ) {

  const db = getDatabase();               
  const productsRef= ref( db, "products" ); 
  try {
    const snapshot= await get( productsRef ) ;
    if ( !snapshot.exists() ) return [ ];
    
    const data = snapshot.val( );

    return Object.entries(data).map(([ id, raw ]) => ({
      id,
      ...raw,
      createdAt: raw.createdAt || "",
    }
  )
  );
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];                              // fail gracefully
  }
}

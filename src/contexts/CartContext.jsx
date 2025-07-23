// src/contexts/CartContext.jsx

import React, { createContext, useReducer, useContext, useEffect } from "react";

// --- Action Types ---
const ADD_ITEM    = "ADD_ITEM";
const REMOVE_ITEM = "REMOVE_ITEM";
const UPDATE_QTY  = "UPDATE_QTY";
const CLEAR_CART  = "CLEAR_CART";

// --- Versioning for localStorage shape changes ---
const CART_VERSION = 1;
const STORAGE_KEY   = "cart";
const VERSION_KEY   = "cart_version";

// --- Reducer ---
function cartReducer(state, action) {
  switch (action.type) {
    case ADD_ITEM: {
      // Normalize the incoming payload
      const raw = action.payload;
      const item = {
        ...raw,
        price: parseFloat(raw.price) || 0
      };

      const exists = state.find(i => i.id === item.id);
      if (exists) {
        return state.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...state, { ...item, quantity: 1 }];
    }

    case REMOVE_ITEM:
      return state.filter(i => i.id !== action.payload.id);

    case UPDATE_QTY:
      return state
        .map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: action.payload.quantity }
            : i
        )
        .filter(i => i.quantity > 0);

    case CLEAR_CART:
      return [];

    default:
      return state;
  }
}

// --- Contexts ---
const CartStateContext    = createContext([]);
const CartDispatchContext = createContext(() => {});

// --- Rehydrate function with version & coercion ---
function rehydrate() {
  try {
    const storedVersion = parseInt(localStorage.getItem(VERSION_KEY), 10);
    if (storedVersion !== CART_VERSION) {
      // Version mismatch → clear old cart
      localStorage.setItem(VERSION_KEY, CART_VERSION);
      return [];
    }

    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    // Coerce price to Number
    return raw.map(i => ({
      ...i,
      price: parseFloat(i.price) || 0,
      quantity: typeof i.quantity === "number" ? i.quantity : parseInt(i.quantity, 10) || 1
    }));
  } catch {
    // On any error, reset
    localStorage.setItem(VERSION_KEY, CART_VERSION);
    return [];
  }
}

// --- Provider ---
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], rehydrate);

  // Persist cart + version
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    localStorage.setItem(VERSION_KEY, CART_VERSION);
  }, [cart]);

  return (
    <CartStateContext.Provider value={cart}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

// --- Hooks & Action Creators ---
export function useCart() {
  return useContext(CartStateContext);
}
export function useCartDispatch() {
  return useContext(CartDispatchContext);
}

export const addItem    = item => ({ type: ADD_ITEM,    payload: item });
export const removeItem = id   => ({ type: REMOVE_ITEM, payload: { id } });
export const updateQty  = (id, quantity) => ({
  type: UPDATE_QTY,
  payload: { id, quantity },
});
export const clearCart  = () => ({ type: CLEAR_CART });

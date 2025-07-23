import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../style/adminDashboard.module.css";

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState({}); 

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");
    return onValue(usersRef, (snap) => {
      setUsers(snap.val() || {});
      setLoading(false);
    });
  }, []);

  // helper to mark in-progress
  const setBusy = (uid, flag) => {
    setActionInProgress((prev) => ({ ...prev, [uid]: flag }));
  };

  const handleApprove = async (uid) => {
    setBusy(uid, true);
    try {
      await update(ref(getDatabase(), `users/${uid}/seller`), {
        isApproved: true,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(uid, false);
    }
  };

  const handleRevoke = async (uid) => {
    setBusy(uid, true);
    try {
      await update(ref(getDatabase(), `users/${uid}/seller`), {
        isApproved: false,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(uid, false);
    }
  };

  const handleDelete = async (uid) => {
    if (!window.confirm("Really delete user and all data?")) return;
    setBusy(uid, true);
    try {
      await remove(ref(getDatabase(), `users/${uid}`));
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(uid, false);
    }
  };

  if (!currentUser) {
    return <p className={styles.message}>Please log in as admin.</p>;
  }

  // Optionally filter to only admin UIDs
  // if (!currentUser.admin) return <p>Access denied.</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      {loading ? (
        <p className={styles.message}>Loading users…</p>
      ) : (
        <div className={styles.grid}>
          {Object.entries(users).map(([uid, user]) => (
            <div key={uid} className={styles.card}>
              <div className={styles.header}>
                <h2 className={styles.name}>
                  {user.displayName || "(No Name)"}
                </h2>
                <span className={styles.uid}>{uid}</span>
              </div>
              <ul className={styles.details}>
                <li>
                  <strong>Email:</strong> {user.email || "—"}
                </li>
                {user.phoneNumber && (
                  <li>
                    <strong>Phone:</strong> {user.phoneNumber}
                  </li>
                )}
                {user.gender && (
                  <li>
                    <strong>Gender:</strong> {user.gender}
                  </li>
                )}
                {user.seller?.appliedAt && (
                  <li>
                    <strong>Applied:</strong>{" "}
                    {new Date(user.seller.appliedAt).toLocaleString()}
                  </li>
                )}
                {user.seller?.profile?.businessName && (
                  <li>
                    <strong>Business:</strong>{" "}
                    {user.seller.profile.businessName}
                  </li>
                )}
                {user.seller?.profile?.address && (
                  <li>
                    <strong>Address:</strong> {user.seller.profile.address}
                  </li>
                )}
              </ul>
              <div className={styles.actions}>
                {user.seller?.isApproved ? (
                  <button
                    className={styles.revoke}
                    disabled={actionInProgress[uid]}
                    onClick={() => handleRevoke(uid)}
                  >
                    {actionInProgress[uid] ? "Processing…" : "Revoke"}
                  </button>
                ) : user.seller?.appliedAt ? (
                  <button
                    className={styles.approve}
                    disabled={actionInProgress[uid]}
                    onClick={() => handleApprove(uid)}
                  >
                    {actionInProgress[uid] ? "Processing…" : "Approve"}
                  </button>
                ) : (
                  <span className={styles.noApp}>No application</span>
                )}
                <button
                  className={styles.delete}
                  disabled={actionInProgress[uid]}
                  onClick={() => handleDelete(uid)}
                >
                  {actionInProgress[uid] ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
          {Object.keys(users).length === 0 && (
            <p className={styles.message}>No users found.</p>
          )}
        </div>
      )}
    </div>
  );
}

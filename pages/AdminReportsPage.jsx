import React, { useEffect, useState } from "react";
import { ShieldAlert, Clock, User, Trash2, AlertTriangle, Ban, Eye, Zap, CheckCircle } from "lucide-react";
import { db, auth } from "../context/firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  increment,
  writeBatch
} from "firebase/firestore";
import { onAuthStateChanged, deleteUser } from "firebase/auth";

const AdminReportsSystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userWarningCount, setUserWarningCount] = useState(0);


  const fetchUserWarnings = async (userId) => {
    if (!userId) return;

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const warnings = userSnap.data().warnings || 0;
        setUserWarningCount(warnings);
      }
    } catch (err) {
      console.error("Error fetching user warnings:", err);
    }
  };

  useEffect(() => {
    if (activePost && activePost.userId) {
      fetchUserWarnings(activePost.userId);
    } else {
      setUserWarningCount(0);
    }
  }, [activePost]);


  // Authentication and role verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setCurrentUser({ uid: firebaseUser.uid, ...userData });
          } else {
            setCurrentUser(null);
          }
        } catch (err) {
          console.error("Authentication error:", err);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Optimized batch fetching of flagged posts
  useEffect(() => {
    const adminRoles = ["admin", "central_admin", "overall_admin"];
    if (!currentUser || !adminRoles.includes(currentUser.role)) return;

    const loadFlaggedContent = async () => {
      try {
        const q = query(collection(db, "posts"), where("reportCount", ">=", 3));
        const snapshot = await getDocs(q);

        // Get all unique author IDs
        const userIds = [...new Set(snapshot.docs.map(doc => doc.data().authorId).filter(Boolean))];

        // Fetch user data and warning counts
        const userDataPromises = userIds.map(async (userId) => {
          try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              return {
                userId,
                name: userData.name || "Unknown User",
                warnings: userData.warnings || 0
              };
            } else {
              return {
                userId,
                name: "Unknown User",
                warnings: 0
              };
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
            return {
              userId,
              name: "Unknown User",
              warnings: 0
            };
          }
        });

        const userDataResults = await Promise.all(userDataPromises);

        // Create a map for easy access
        const userMap = {};
        userDataResults.forEach(user => {
          userMap[user.userId] = user;
        });

        // Prepare posts with user data
        const postData = snapshot.docs.map((docSnap) => {
          const post = { id: docSnap.id, ...docSnap.data() };
          const authorData = userMap[post.authorId] || { name: "Unknown User", warnings: 0 };

          return {
            ...post,
            authorName: authorData.name,
            warningCount: authorData.warnings
          };
        });

        setFlaggedPosts(postData);
      } catch (err) {
        console.error("Error loading flagged content:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFlaggedContent();
  }, [currentUser]);

  // Fetch incident reports for specific post
  const loadIncidentReports = async (postId) => {
    try {
      const reportsRef = collection(db, "posts", postId, "reports");
      const reportsSnap = await getDocs(reportsRef);
      const incidentData = [];

      for (const reportDoc of reportsSnap.docs) {
        const reportData = reportDoc.data();
        const reporterId = reportData.reportedBy || reportDoc.id;

        try {
          const reporterRef = doc(db, "users", reporterId);
          const reporterSnap = await getDoc(reporterRef);
          const reporterData = reporterSnap.exists() ? reporterSnap.data() : { name: "Anonymous" };

          incidentData.push({
            id: reportDoc.id,
            ...reportData,
            reporterName: reporterData.name || "Anonymous",
          });
        } catch (err) {
          console.error("Error fetching reporter data:", err);
          incidentData.push({
            id: reportDoc.id,
            ...reportData,
            reporterName: "Anonymous",
          });
        }
      }

      setIncidents(incidentData);
    } catch (err) {
      console.error("Error loading incident reports:", err);
    }
  };

  // Delete post action
  const executePostDeletion = async (postId) => {
    if (!confirm("Confirm post termination?")) return;

    setProcessing(true);
    try {
      // Delete post and all subcollections
      const batch = writeBatch(db);

      // Delete main post
      const postRef = doc(db, "posts", postId);
      batch.delete(postRef);

      // Delete reports subcollection
      const reportsRef = collection(db, "posts", postId, "reports");
      const reportsSnap = await getDocs(reportsRef);
      reportsSnap.docs.forEach(reportDoc => {
        batch.delete(reportDoc.ref);
      });

      await batch.commit();

      setFlaggedPosts(prev => prev.filter(post => post.id !== postId));
      setActivePost(null);

    } catch (err) {
      console.error("Post deletion failed:", err);
      alert("Operation failed");
    } finally {
      setProcessing(false);
    }
  };

  // Issue warning to user
  const issueWarning = async (postId) => {
    // First, get the post data to extract userId and username
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      alert("Post not found");
      return;
    }

    const postData = postSnap.data();
    const userId = postData.userId;
    const userName = postData.username || "Unknown User";

    if (!userId) {
      alert("Cannot issue warning: User ID is missing from post data");
      return;
    }

    if (!confirm(`Issue warning to ${userName} and delete this post?`)) return;

    setProcessing(true);
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentWarnings = userSnap.data().warnings || 0;
        const newWarnings = currentWarnings + 1;

        // Update user warnings
        await updateDoc(userRef, {
          warnings: newWarnings
        });

        // Call executePostDeletion instead of direct deletion (UPDATED)
        await executePostDeletion(postId);

        // Update local state - remove the deleted post from flaggedPosts
        setFlaggedPosts(prev => prev.filter(post => post.postId !== postId));

        // Clear active post if it's the same post
        if (activePost && activePost.postId === postId) {
          setActivePost(null);
        }

        // Update the user warning count state
        setUserWarningCount(newWarnings);

        if (newWarnings >= 3) {
          await executeUserTermination(userId, userName);
          alert(`Warning issued to ${userName}. User terminated due to reaching 3 warnings. Post deleted.`);
        } else {
          alert(`Warning issued to ${userName}. Total warnings: ${newWarnings}. Post deleted.`);
        }
      } else {
        alert("User not found");
      }
    } catch (err) {
      console.error("Warning system error:", err);
      alert("Warning failed");
    } finally {
      setProcessing(false);
    }
  };

  // Mark as reviewed - clear reports and reset reportCount
  const markAsReviewed = async (postId) => {
    if (!confirm("Mark this post as reviewed? This will clear all reports.")) return;

    setProcessing(true);
    try {
      const batch = writeBatch(db);

      // Reset report count
      const postRef = doc(db, "posts", postId);
      batch.update(postRef, { reportCount: 0 });

      // Delete all reports in the subcollection
      const reportsRef = collection(db, "posts", postId, "reports");
      const reportsSnap = await getDocs(reportsRef);
      reportsSnap.docs.forEach(reportDoc => {
        batch.delete(reportDoc.ref);
      });

      await batch.commit();

      // Update local state
      setFlaggedPosts(prev => prev.filter(post => post.id !== postId));
      setActivePost(null);

      alert("Post marked as reviewed. All reports cleared.");
    } catch (err) {
      console.error("Review action failed:", err);
      alert("Operation failed");
    } finally {
      setProcessing(false);
    }
  };

  // Terminate user account
  const executeUserTermination = async (userId, userName) => {
    try {
      // Delete user data from Firestore
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);

      // Note: Firebase Auth user deletion requires admin SDK server-side
      // This would typically be handled by a cloud function

      alert(`User ${userName} terminated (3+ warnings)`);
    } catch (err) {
      console.error("User termination error:", err);
      alert("Termination failed");
    }
  };

  // Access control
  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl font-mono text-cyan-400">AUTHENTICATING...</span>
        </div>
      </div>
    );
  }

  const adminRoles = ["admin", "central_admin", "overall_admin"];
  if (!adminRoles.includes(currentUser.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <Ban className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <div className="text-2xl font-mono text-red-500">ACCESS DENIED</div>
          <div className="text-gray-500 mt-2">INSUFFICIENT PRIVILEGES</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      {/* Soft background accents */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent_70%)]"></div>

      <div className="relative z-10 px-8 pt-32">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <ShieldAlert className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              THREAT DETECTION
            </h1>
          </div>
          <div className="text-slate-500 font-medium">Monitoring high-risk content across the network</div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Scanning Database...</span>
          </div>
        ) : flaggedPosts.length === 0 ? (
          <div className="text-center py-32 bg-white/50 rounded-[3rem] border border-dashed border-gray-200">
            <div className="text-indigo-600 font-bold text-xl mb-2">System Clean</div>
            <div className="text-slate-400">No high-risk content detected in the network</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {flaggedPosts.map((post) => (
              <div
                key={post.id}
                className="group cursor-pointer bg-white border border-gray-100 rounded-[2.5rem] hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 p-8 relative overflow-hidden"
                onClick={() => {
                  setActivePost(post);
                  loadIncidentReports(post.id);
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Flagged Instance</span>
                  </div>
                  <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {post.reportCount} Reports
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-600 line-clamp-3 text-sm leading-relaxed font-medium italic">
                    "{post.content || "No content available"}"
                  </p>

                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <User className="h-3 w-3" />
                    <span>Author: {post.username || "Unknown"}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <Eye className="h-4 w-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0" />
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">Start Investigation</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Investigation Modal */}
        {activePost && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 md:p-8">
            <div className="bg-white rounded-[3.5rem] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white flex flex-col">
              {/* Modal Header */}
              <div className="border-b border-gray-50 p-8 md:p-12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Incident Analysis</h2>
                      <p className="text-sm text-slate-400 font-medium">Deep inspection of flagged transmission</p>
                    </div>
                  </div>
                  <div className="bg-rose-50 text-rose-600 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                    {activePost.reportCount} Critical Reports
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 overflow-y-auto max-h-[60vh] bg-slate-50/50">
                {/* Post Content */}
                <div className="mb-10 p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Flagged Transmission</h3>
                  <p className="text-slate-700 text-lg leading-relaxed font-medium italic">
                    "{activePost.content || "No content available"}"
                  </p>

                  <div className="mt-8 flex flex-wrap gap-6 border-t border-gray-50 pt-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <User className="h-3 w-3 text-indigo-500" />
                      <span>Author: {activePost.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <AlertTriangle className="h-3 w-3 text-rose-500" />
                      <span>Security Warnings: {userWarningCount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="text-indigo-500">UID:</span>
                      <span className="font-mono text-xs font-normal lowercase">{activePost.userId}</span>
                    </div>
                  </div>
                </div>

                {/* Reports */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] ml-2">Incident Certificates</h3>
                  {incidents.length === 0 ? (
                    <div className="text-slate-300 font-bold uppercase tracking-widest text-xs py-10 text-center">No reports loaded...</div>
                  ) : (
                    <div className="space-y-4">
                      {incidents.map((report) => (
                        <div
                          key={report.id}
                          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-1">Violation Type</span>
                              <p className="text-slate-700 font-bold text-sm">{report.reason}</p>
                            </div>
                            {report.additionalInfo && (
                              <div>
                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Additional Analysis</span>
                                <p className="text-slate-600 text-sm italic">"{report.additionalInfo}"</p>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-slate-400 border-t border-gray-50 pt-4 mt-2">
                              <Clock className="h-3 w-3" />
                              <span className="text-[9px] font-black uppercase tracking-widest">
                                {report.time ? new Date(report.time).toLocaleString() : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-400 border-t border-gray-50 pt-4 mt-2">
                              <User className="h-3 w-3" />
                              <span className="text-[9px] font-black uppercase tracking-widest">
                                Reported by: {report.reporterName}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-50 p-8 md:p-10 bg-white">
                <div className="flex flex-wrap gap-4">
                  <button
                    className="flex items-center gap-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                    onClick={() => executePostDeletion(activePost.id)}
                    disabled={processing}
                  >
                    <Trash2 className="h-4 w-4" />
                    Terminate Post
                  </button>

                  <button
                    className="flex items-center gap-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                    onClick={() => issueWarning(activePost.id)}
                    disabled={processing}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Issue Warning
                  </button>

                  <button
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                    onClick={() => markAsReviewed(activePost.id)}
                    disabled={processing}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Reviewed
                  </button>

                  <button
                    className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-500 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ml-auto"
                    onClick={() => setActivePost(null)}
                  >
                    Abort
                  </button>
                </div>

                {processing && (
                  <div className="mt-8 flex items-center gap-3 text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] justify-center bg-indigo-50 py-4 rounded-2xl animate-pulse">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Executing Command...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsSystem;
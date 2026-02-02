import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type DevStatus = {
  current_model: string;
  primary_model: string;
  fallback_model: string;
  quota_reset_time: string | null;
  server_time: string;
  api_key_configured: boolean;
};

type DevUser = {
  username: string;
  name: string;
  role: string;
  email: string;
};

export default function DevDashboard() {
  const [status, setStatus] = useState<DevStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modelInput, setModelInput] = useState("");
  const [users, setUsers] = useState<DevUser[]>([]);
  const [showUsers, setShowUsers] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/dev/status", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      setStatus(data);
      setModelInput(data.current_model);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/dev/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
      setShowUsers(true);
    } catch (err: any) {
      alert("Error fetching users: " + err.message);
    }
  };

  const handleSwitchModel = async (model: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/dev/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ model_name: model }),
      });
      if (!res.ok) throw new Error("Failed to update model");
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading && !status) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-anuphan">
       <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🛠️ Developer Dashboard</h1>
          <Link to="/admin" className="text-blue-600 hover:underline">
            Back to Admin
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h2 className="text-lg font-semibold mb-4 text-blue-800">🤖 Gemini Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Model:</span>
                <span className="font-mono font-bold text-green-700">{status?.current_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Primary Config:</span>
                <span className="font-mono text-gray-800">{status?.primary_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fallback Config:</span>
                <span className="font-mono text-gray-800">{status?.fallback_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Key Set:</span>
                <span className={`font-bold ${status?.api_key_configured ? "text-green-600" : "text-red-600"}`}>
                  {status?.api_key_configured ? "YES" : "NO"}
                </span>
              </div>
              {status?.quota_reset_time && (
                 <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm">
                    ⚠️ Fallback Active until: {new Date(status.quota_reset_time).toLocaleString()}
                 </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">⚙️ Controls</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wait Force Switch Model
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={modelInput} 
                    onChange={(e) => setModelInput(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g. gemini-1.5-flash"
                  />
                  <button 
                    onClick={() => handleSwitchModel(modelInput)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                 <button 
                    onClick={() => handleSwitchModel(status?.primary_model || "")}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Reset from Primary
                 </button>
                 <button 
                    onClick={() => handleSwitchModel(status?.fallback_model || "")}
                    className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                  >
                    Force Fallback
                 </button>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                 <button 
                    onClick={fetchUsers}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                 >
                    {showUsers ? "Refresh Users List" : "Show All Users (Debug)"}
                 </button>
              </div>
            </div>
          </div>
        </div>

        {showUsers && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.username}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

       </div>
    </div>
  );
}

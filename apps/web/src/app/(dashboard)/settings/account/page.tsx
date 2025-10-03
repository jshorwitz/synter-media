'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Key, Users, UserPlus, X, Clock, Shield } from 'lucide-react';

type TeamMember = {
  id: number;
  email: string;
  role: string;
  joined_at: string;
};

type TeamInvite = {
  id: number;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
};

export default function AccountSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  
  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);

  // User profile (mock for now)
  const [userProfile, setUserProfile] = useState({
    name: 'Joel Horwitz',
    email: 'joel@example.com',
  });

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      const response = await fetch('/api/team/members');
      const data = await response.json();
      setMembers(data.members || []);
      setInvites(data.invites || []);
    } catch (error) {
      console.error('Failed to load team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) return;

    setInviting(true);

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteEmail('');
        setInviteRole('MEMBER');
        await loadTeamData();
        alert('Invite sent successfully!');
      } else {
        alert(data.error || 'Failed to send invite');
      }
    } catch (error) {
      console.error('Invite error:', error);
      alert('Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (inviteId: number) => {
    if (!confirm('Cancel this invite?')) return;

    try {
      await fetch('/api/team/invite/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });

      await loadTeamData();
    } catch (error) {
      console.error('Cancel invite error:', error);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Remove this team member?')) return;

    try {
      await fetch('/api/team/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });

      await loadTeamData();
    } catch (error) {
      console.error('Remove member error:', error);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="panel">
          <h2 className="panel-title mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              Update Password
            </button>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </h2>

          {/* Invite Form */}
          <form onSubmit={handleInvite} className="mb-6 p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invite Team Member
            </h3>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="VIEWER">Viewer</option>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                type="submit"
                disabled={inviting}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>

          {/* Active Members */}
          {members.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Active Members ({members.length})</h3>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-600 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{member.email}</div>
                        <div className="text-xs text-slate-400">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-700 px-2 py-1 rounded text-xs text-slate-300">
                        <Shield className="w-3 h-3" />
                        {member.role}
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Pending Invites ({invites.length})</h3>
              <div className="space-y-2">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{invite.email}</div>
                        <div className="text-xs text-slate-400">
                          Invited {new Date(invite.created_at).toLocaleDateString()} • Expires{' '}
                          {new Date(invite.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-700 px-2 py-1 rounded text-xs text-slate-300">
                        <Shield className="w-3 h-3" />
                        {invite.role}
                      </div>
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {members.length === 0 && invites.length === 0 && !loading && (
            <div className="text-center py-8 text-slate-400">
              No team members yet. Invite someone to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

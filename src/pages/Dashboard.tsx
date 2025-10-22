import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, TrendingUp, Play } from 'lucide-react';
import { useAuth } from '../services/auth/useAuth';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');

  // Debug pour vérifier l'état d'authentification sur le dashboard
  console.log('🎯 Dashboard - Auth state:', {
    hasUser: !!user,
    userEmail: user?.email,
    isAuthenticated
  });

  const handleNewSession = () => {
    setIsModalOpen(true);
  };

  const handleSessionSubmit = () => {
    if (sessionName.trim()) {
      setIsModalOpen(false);
      // Navigate to chat page with session name
      navigate(`/chat/${encodeURIComponent(sessionName.trim())}`);
    }
  };

  const stats = [
    {
      label: 'Sessions complétées',
      value: '12',
      icon: Calendar,
      color: 'bg-slate-500',
    },
    {
      label: 'Score moyen',
      value: '78%',
      icon: TrendingUp,
      color: 'bg-slate-600',
    },
    {
      label: 'Temps total',
      value: '3h 45min',
      icon: User,
      color: 'bg-slate-700',
    },
  ];

  const recentSessions = [
    {
      id: '1',
      title: 'Entretien technique React',
      date: '2024-01-15',
      score: 85,
      duration: '45 min',
    },
    {
      id: '2',
      title: 'Simulation commerciale',
      date: '2024-01-14',
      score: 72,
      duration: '30 min',
    },
    {
      id: '3',
      title: 'Présentation de projet',
      date: '2024-01-12',
      score: 90,
      duration: '20 min',
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 [text-shadow:_0_1px_2px_rgb(255_255_255_/_0.8)]">
                Bonjour, {user?.first_name} 👋
              </h1>
              <p className="text-slate-600 mt-1">Prêt à améliorer vos compétences d'entretien ?</p>
            </div>
            <Button
              variant="gradient"
              className="px-6 py-3 text-base font-semibold shadow-xl"
              onClick={handleNewSession}
            >
              <Play className="w-5 h-5 mr-2" />
              Nouvelle session
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/50 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-2xl p-4 mr-6 shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold text-slate-900 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.1)]">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Sessions */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
            <h2 className="text-2xl font-bold text-slate-900 [text-shadow:_0_1px_2px_rgb(255_255_255_/_0.8)]">Sessions récentes</h2>
            <p className="text-slate-600 mt-1">Vos dernières séances d'entraînement</p>
          </div>
          <div className="p-8">
            {recentSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <p className="text-slate-600 text-lg mb-6">Aucune session récente</p>
                <Button variant="gradient" className="px-8 py-4 text-lg font-semibold shadow-2xl">
                  Commencer votre première session
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-6 bg-white/60 rounded-xl border border-slate-200/50 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg mb-2">{session.title}</h3>
                      <p className="text-slate-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {session.date} • {session.duration}
                      </p>
                    </div>
                    <div className="text-right mr-6">
                      <div className="text-3xl font-bold text-emerald-600 [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.1)]">
                        {session.score}%
                      </div>
                      <p className="text-slate-500 text-sm">Score</p>
                    </div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Créer une nouvelle session"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nom de la session
            </label>
            <p className="text-sm text-slate-500 mb-4">
              Donnez un nom à votre session d'entraînement pour la retrouver facilement plus tard.
            </p>
            <Input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Ex: Entretien technique React, Simulation commerciale..."
              className="w-full"
              onKeyPress={(e) => e.key === 'Enter' && handleSessionSubmit()}
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="px-6"
            >
              Annuler
            </Button>
            <Button
              variant="gradient"
              onClick={handleSessionSubmit}
              disabled={!sessionName.trim()}
              className="px-6 shadow-xl"
            >
              Commencer la session
            </Button>
          </div>
        </div>
      </Modal>


    </>
  );
};

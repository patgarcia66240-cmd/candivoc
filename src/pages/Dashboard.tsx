import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { User, Calendar, TrendingUp, Play, Clock, Star, Target, Award } from 'lucide-react';
import { useAuth } from '../services/auth/useAuth';
import { useUserSessions } from '../hooks/useSessions';
import { useScenarios } from '../hooks/useScenarios';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { DashboardSkeleton } from '../components/ui/DashboardSkeleton';

export const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');

  // Récupérer les sessions et scénarios réels
  const { data: sessions = [], isLoading: sessionsLoading } = useUserSessions(user?.id || '');
  const { data: scenarios = [], isLoading: scenariosLoading } = useScenarios();

  const handleNewSession = () => {
    setIsModalOpen(true);
  };

  const handleSessionSubmit = () => {
    if (sessionName.trim()) {
      setIsModalOpen(false);
      // Navigate to chat page with session name
      navigate({ to: `/app/chat/${encodeURIComponent(sessionName.trim())}` });
    }
  };

  // Calculer les statistiques réelles
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalDuration = completedSessions.reduce((acc, session) => {
    if (session.duration) return acc + session.duration;
    if (session.startTime && session.endTime) {
      return acc + (new Date(session.endTime).getTime() - new Date(session.startTime).getTime());
    }
    return acc;
  }, 0);

  const averageScore = completedSessions.length > 0
    ? completedSessions.reduce((acc, session) => {
        const score = session.evaluation?.overallScore || 0;
        return acc + score;
      }, 0) / completedSessions.length
    : 0;

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  const stats = [
    {
      label: 'Sessions complétées',
      value: completedSessions.length.toString(),
      icon: Calendar,
      color: 'bg-slate-500',
    },
    {
      label: 'Score moyen',
      value: `${Math.round(averageScore)}%`,
      icon: TrendingUp,
      color: 'bg-slate-600',
    },
    {
      label: 'Temps total',
      value: formatDuration(totalDuration),
      icon: Clock,
      color: 'bg-slate-700',
    },
  ];

  // Formater les sessions récentes
  const recentSessions = sessions.slice(0, 5).map(session => ({
    id: session.id,
    title: session.scenarioId || `Session du ${new Date(session.createdAt).toLocaleDateString()}`,
    date: new Date(session.createdAt).toLocaleDateString('fr-FR'),
    score: session.evaluation?.overallScore || 0,
    duration: session.duration
      ? formatDuration(session.duration)
      : session.startTime && session.endTime
        ? formatDuration(new Date(session.endTime).getTime() - new Date(session.startTime).getTime())
        : 'En cours',
    status: session.status
  }));

  // Afficher le skeleton pendant le chargement
  if (loading || sessionsLoading || scenariosLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {/* Header */}
      <div className="bg-linear-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-lg border-b border-slate-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white [text-shadow:0_1px_2px_rgb(255_255_255/0.8)]">
                Bonjour, {user?.first_name} 👋
              </h1>
              <p className="text-slate-600 dark:text-gray-300 mt-1">Prêt à améliorer vos compétences d'entretien ?</p>
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
            <div key={index} className="bg-linear-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-slate-200/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-2xl p-4 mr-6 shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white [text-shadow:0_2px_4px_rgb(0_0_0/0.1)]">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Sessions */}
        <div className="bg-linear-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="px-8 py-6 bg-linear-to-r from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800 border-b border-slate-300 dark:border-gray-600">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white [text-shadow:0_1px_2px_rgb(255_255_255/0.8)]">Sessions récentes</h2>
            <p className="text-slate-600 dark:text-gray-300 mt-1">Vos dernières séances d'entraînement</p>
          </div>
          <div className="p-8">
            {recentSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-linear-to-br from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <p className="text-slate-600 dark:text-gray-300 text-lg mb-6">Aucune session récente</p>
                <Button variant="gradient" className="px-8 py-4 text-lg font-semibold shadow-2xl">
                  Commencer votre première session
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-6 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-slate-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-lg transition-all duration-300">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{session.title}</h3>
                      <p className="text-slate-600 dark:text-gray-300 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {session.date} • {session.duration}
                      </p>
                    </div>
                    <div className="text-right mr-6">
                      {session.status === 'completed' && session.score > 0 ? (
                        <>
                          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 [text-shadow:0_1px_2px_rgb(0_0_0/0.1)]">
                            {session.score}%
                          </div>
                          <p className="text-slate-500 dark:text-gray-400 text-sm">Score</p>
                        </>
                      ) : session.status === 'active' ? (
                        <>
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 [text-shadow:0_1px_2px_rgb(0_0_0/0.1)]">
                            En cours
                          </div>
                          <p className="text-slate-500 dark:text-gray-400 text-sm">Statut</p>
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-bold text-slate-600 dark:text-slate-400 [text-shadow:0_1px_2px_rgb(0_0_0/0.1)]">
                            {session.status === 'pending' ? 'En attente' : 'Abandonnée'}
                          </div>
                          <p className="text-slate-500 dark:text-gray-400 text-sm">Statut</p>
                        </>
                      )}
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      session.status === 'completed' ? 'bg-emerald-500' :
                      session.status === 'active' ? 'bg-blue-500 animate-pulse' :
                      session.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scénarios disponibles */}
        <div className="mt-8 bg-linear-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="px-8 py-6 bg-linear-to-r from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800 border-b border-slate-300 dark:border-gray-600">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white [text-shadow:0_1px_2px_rgb(255_255_255/0.8)]">
              Scénarios disponibles
            </h2>
            <p className="text-slate-600 dark:text-gray-300 mt-1">
              Choisissez un scénario pour votre prochaine session d'entraînement
            </p>
          </div>
          <div className="p-8">
            {scenarios.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-linear-to-br from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <p className="text-slate-600 dark:text-gray-300 text-lg mb-6">
                  Aucun scénario disponible
                </p>
                <p className="text-slate-500 dark:text-gray-400 text-sm">
                  Les scénarios apparaîtront ici une fois disponibles
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarios.slice(0, 6).map((scenario) => (
                  <div key={scenario.id} className="bg-white/60 dark:bg-gray-800/60 rounded-xl border border-slate-200/50 dark:border-gray-700/50 p-6 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                          {scenario.title}
                        </h3>
                        <p className="text-slate-500 dark:text-gray-400 text-sm">
                          {scenario.category} • {scenario.difficulty}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {scenario.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-slate-600 dark:text-gray-300">
                          {scenario.is_public ? 'Public' : 'Privé'}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSessionName(scenario.title);
                          setIsModalOpen(true);
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Commencer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {scenarios.length > 6 && (
              <div className="mt-6 text-center">
                <Button variant="ghost" className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">
                  Voir tous les scénarios ({scenarios.length})
                </Button>
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

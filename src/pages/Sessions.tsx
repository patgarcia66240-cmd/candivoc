import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../services/auth/useAuth';
import { useUserSessions } from '../hooks/useSessions';
import {
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  PlayIcon,
  UserIcon,

  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { SessionsSkeleton } from '../components/ui/SessionsSkeleton';

export const Sessions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  // Utiliser le hook React Query pour les sessions
  const { data: sessions = [], isLoading, error } = useUserSessions(user?.id || '');

  const handleNewSession = () => {
    setIsModalOpen(true);
  };

  const handleSessionSubmit = () => {
    if (sessionName.trim()) {
      setIsModalOpen(false);
      // Naviguer vers le chat avec le nom de la session
      navigate({
        to: '/app/chat/$sessionId',
        params: { sessionId: encodeURIComponent(sessionName.trim()) }
      });
    }
  };

  // Formater les sessions pour l'affichage
  const formattedSessions = sessions.map(session => ({
    id: session.id,
    title: session.scenarioId || `Session ${session.id}`,
    scenarioTitle: session.scenarioId || `Session ${session.id}`,
    date: new Date(session.createdAt).toLocaleDateString('fr-FR'),
    duration: session.duration
      ? `${Math.round(session.duration / (1000 * 60))} min`
      : session.startTime && session.endTime
        ? `${Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60))} min`
        : 'N/A',
    score: session.evaluation?.overallScore,
    status: session.status as 'completed' | 'in_progress' | 'abandoned',
    feedback: session.evaluation?.feedback
  }));

  const getStatusColor = (status: 'completed' | 'in_progress' | 'abandoned') => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/60';
      case 'in_progress':
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-200 dark:border-slate-700/60';
      case 'abandoned':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/60';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700/60';
    }
  };

  const getStatusIcon = (status: 'completed' | 'in_progress' | 'abandoned') => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'in_progress':
        return <ExclamationCircleIcon className="w-4 h-4" />;
      case 'abandoned':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: 'completed' | 'in_progress' | 'abandoned') => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'in_progress':
        return 'En cours';
      case 'abandoned':
        return 'Abandonnée';
      default:
        return status;
    }
  };

  // Afficher le skeleton pendant le chargement
  if (isLoading) {
    return <SessionsSkeleton />;
  }

  // Gérer les erreurs
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Erreur lors du chargement des sessions
          </h2>
          <p className="text-red-700">
            Impossible de charger vos sessions. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Historique des sessions
            </h1>
            <Button
              variant="gradient"
              onClick={handleNewSession}
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              Nouvelle session
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-linear-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 hover:shadow-md hover:border-gray-300/60 transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-linear-to-br from-slate-500 to-slate-600 rounded-xl p-3 mr-4 shadow-sm group-hover:shadow-md transition-all duration-200">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total sessions</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 dark:text-gray-200 transition-colors">{formattedSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="group bg-linear-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 hover:shadow-md hover:border-gray-300/60 transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-linear-to-br from-slate-600 to-slate-700 rounded-xl p-3 mr-4 shadow-sm group-hover:shadow-md transition-all duration-200">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Score moyen</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 dark:text-gray-200 transition-colors">
                  {formattedSessions.filter(s => s.score).length > 0
                    ? Math.round(formattedSessions.filter(s => s.score).reduce((acc, s) => acc + (s.score || 0), 0) / formattedSessions.filter(s => s.score).length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-linear-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 hover:shadow-md hover:border-gray-300/60 transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-linear-to-br from-slate-700 to-slate-800 rounded-xl p-3 mr-4 shadow-sm group-hover:shadow-md transition-all duration-200">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Temps total</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 dark:text-gray-200 transition-colors">2h 0min</p>
              </div>
            </div>
          </div>

          <div className="group bg-linear-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 hover:shadow-md hover:border-gray-300/60 transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-linear-to-br from-slate-400 to-slate-500 rounded-xl p-3 mr-4 shadow-sm group-hover:shadow-md transition-all duration-200">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Taux de complétion</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 dark:text-gray-200 transition-colors">
                  {formattedSessions.length > 0
                    ? Math.round((formattedSessions.filter(s => s.status === 'completed').length / formattedSessions.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-linear-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-900/30 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/60">
          <div className="px-6 py-5 border-b border-gray-200/60 bg-linear-to-r from-gray-50/50 to-white">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Toutes les sessions</h2>
          </div>

          <div className="p-6">
            {formattedSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-linear-to-br from-gray-100 to-gray-200/50 rounded-full p-6 w-fit mx-auto mb-6">
                  <CalendarIcon className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Aucune session trouvée</p>
                <p className="text-gray-400 text-sm mb-6">Commencez votre première session d'entraînement</p>
                <Button
                  variant="gradient"
                  className="shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={handleNewSession}
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Commencer votre première session
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formattedSessions.map((session) => (
                  <div key={session.id} className="group flex items-center justify-between p-6 bg-linear-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900/50 rounded-xl border border-gray-200/60 dark:border-gray-700/60 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Status Icon */}
                      <div className={`shrink-0 p-2 rounded-lg ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : session.status === 'in_progress' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-600'}`}>
                        {getStatusIcon(session.status)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg group-hover:text-gray-800 dark:text-gray-200 transition-colors">
                            {session.scenarioTitle}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(session.status)}`}>
                            {getStatusIcon(session.status)}
                            <span className="ml-1">{getStatusText(session.status)}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{session.duration}</span>
                          </div>
                        </div>

                        {session.feedback && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border-l-4 border-gray-300">
                            {session.feedback}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 ml-6">
                      {session.score !== undefined && (
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${session.score >= 80 ? 'text-emerald-600' : session.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {session.score}%
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Score</p>
                        </div>
                      )}

                      <Button
                        variant="gradient"
                        size="sm"
                        className="shadow-sm hover:shadow-md transition-all duration-200"
                        onClick={() => navigate({
                          to: '/app/session/$sessionId',
                          params: { sessionId: session.id }
                        })}
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Voir les détails
                      </Button>
                    </div>
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

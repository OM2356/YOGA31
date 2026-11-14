import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CoachDrawerProvider } from './context/CoachDrawerContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WorkspaceLayout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { YogaStudioPage } from './pages/YogaStudioPage';
import { MeditationPage } from './pages/MeditationPage';
import { BreathingPage } from './pages/BreathingPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { PlannerPage } from './pages/PlannerPage';
import { MoodTrackerPage } from './pages/MoodTrackerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DeepDivePage } from './pages/DeepDivePage';
import { KnowledgeHubPage } from './pages/KnowledgeHubPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { RemindersPage } from './pages/RemindersPage';
import { GoogleChatPage } from './pages/GoogleChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <CoachDrawerProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />

            <Route
              path="/dashboard"
              element={
                <WorkspaceLayout>
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                </WorkspaceLayout>
              }
            />
            <Route
              path="/yoga"
              element={
                <WorkspaceLayout>
                  <YogaStudioPage />
                </WorkspaceLayout>
              }
            />
            <Route
              path="/meditation"
              element={
                <WorkspaceLayout>
                  <MeditationPage />
                </WorkspaceLayout>
              }
            />
            <Route
              path="/breathing"
              element={
                <WorkspaceLayout>
                  <BreathingPage />
                </WorkspaceLayout>
              }
            />
            <Route
              path="/assistant"
              element={
                <WorkspaceLayout>
                  <AIAssistantPage />
                </WorkspaceLayout>
              }
            />
            <Route
              path="/yoga-coach"
              element={
                <WorkspaceLayout>
                  <AIAssistantPage defaultMode="yoga-coach" />
                </WorkspaceLayout>
              }
            />
            <Route
              path="/planner"
              element={
                <WorkspaceLayout>
                  <ProtectedRoute>
                    <PlannerPage />
                  </ProtectedRoute>
                </WorkspaceLayout>
              }
            />
            <Route
              path="/mood"
              element={
                <WorkspaceLayout>
                  <ProtectedRoute>
                    <MoodTrackerPage />
                  </ProtectedRoute>
                </WorkspaceLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <WorkspaceLayout>
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                </WorkspaceLayout>
              }
            />
            <Route
              path="/deep-dive"
              element={
                <WorkspaceLayout>
                  <DeepDivePage />
                </WorkspaceLayout>
              }
            />
            <Route
              path="/knowledge"
              element={
                <WorkspaceLayout>
                  <KnowledgeHubPage />
                </WorkspaceLayout>
              }
            />
            <Route
              path="/challenges"
              element={
                <WorkspaceLayout>
                  <ChallengesPage />
                </WorkspaceLayout>
              }
            />
            <Route
              path="/reminders"
              element={
                <WorkspaceLayout>
                  <ProtectedRoute>
                    <RemindersPage />
                  </ProtectedRoute>
                </WorkspaceLayout>
              }
            />
            <Route
              path="/chat"
              element={
                <WorkspaceLayout>
                  <ProtectedRoute>
                    <GoogleChatPage />
                  </ProtectedRoute>
                </WorkspaceLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <WorkspaceLayout>
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                </WorkspaceLayout>
              }
            />
            <Route
              path="/admin"
              element={
                <WorkspaceLayout>
                  <ProtectedRoute adminOnly>
                    <AdminPage />
                  </ProtectedRoute>
                </WorkspaceLayout>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </CoachDrawerProvider>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

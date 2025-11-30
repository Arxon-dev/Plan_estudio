import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import './styles/flow-diagram.css';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MobileWarningBanner } from './components/MobileWarningBanner';
import { GlobalAnnouncementBanner } from './components/GlobalAnnouncementBanner';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreatePlan } from './pages/CreatePlan';
import AIQuestionGenerator from './pages/AIQuestionGenerator';
import AdminSettings from './pages/AdminSettings';
import { Sessions } from './pages/Sessions';
import { Themes } from './pages/Themes';
import { ManualPlanner } from './pages/ManualPlanner';
import SmartCalendar from './pages/SmartCalendar';
import Today from './pages/Today';
import { Profile } from './pages/Profile';
import GuidePage from './pages/GuidePage';
import { PremiumFeatures } from './pages/PremiumFeatures';
import { TelegramCommunity } from './pages/TelegramCommunity';
import { AdminPanel } from './pages/AdminPanel';
import ImportQuestions from './pages/ImportQuestions';
import ManageQuestions from './pages/ManageQuestions';

import Tests from './pages/Tests';
import TestSession from './pages/TestSession';
import TestResults from './pages/TestResults';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentCancel } from './pages/PaymentCancel';
import { UserList } from './pages/admin/UserList';
import { UserManagement } from './pages/admin/UserManagement';
import { UserProgress } from './pages/admin/UserProgress';
import { SyllabusManagement } from './pages/admin/SyllabusManagement';
import { GuideEditor } from './pages/admin/GuideEditor';
import { MarketingSettings } from './pages/admin/MarketingSettings';
import { Announcements } from './pages/admin/Announcements';
import { SystemLogs } from './pages/admin/SystemLogs';
import { AIUsageDashboard } from './pages/admin/AIUsageDashboard';
import { SimulacroManagement } from './pages/admin/SimulacroManagement';
import { SimulacroList } from './pages/SimulacroList';
import { MaintenancePage } from './pages/MaintenancePage';
import BaremoPage from './pages/baremo/BaremoPage';
import RankingPage from './pages/ranking/RankingPage';
import { CustomBlocksWizard } from './components/CustomBlocksWizard';
import ChatPage from './pages/ChatPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Mobile Warning Banner - Shown globally */}
          <MobileWarningBanner />
          <GlobalAnnouncementBanner />

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/admin/ai-generator" element={<AIQuestionGenerator />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="usuarios/gestion/:id" element={<UserManagement />} />
            <Route path="usuarios/progreso" element={<UserProgress />} />
            <Route path="contenido/temario" element={<SyllabusManagement />} />
            <Route path="contenido/guias" element={<GuideEditor />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-plan"
              element={
                <ProtectedRoute>
                  <CreatePlan />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions"
              element={
                <ProtectedRoute>
                  <Sessions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/themes"
              element={
                <ProtectedRoute>
                  <Themes />
                </ProtectedRoute>
              }
            />


            <Route
              path="/manual-planner"
              element={
                <ProtectedRoute>
                  <ManualPlanner />
                </ProtectedRoute>
              }
            />

            <Route
              path="/smart-calendar"
              element={
                <ProtectedRoute>
                  <SmartCalendar />
                </ProtectedRoute>
              }
            />

            <Route
              path="/custom-blocks"
              element={
                <ProtectedRoute>
                  <CustomBlocksWizard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/today"
              element={
                <ProtectedRoute>
                  <Today />
                </ProtectedRoute>
              }
            />

            <Route
              path="/guide"
              element={
                <ProtectedRoute>
                  <GuidePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/premium"
              element={
                <ProtectedRoute>
                  <PremiumFeatures />
                </ProtectedRoute>
              }
            />

            <Route
              path="/telegram"
              element={
                <ProtectedRoute>
                  <TelegramCommunity />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            <Route path="/admin/usuarios/listado" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
            <Route path="/admin/usuarios/gestion/:id" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/usuarios/progreso" element={<ProtectedRoute><UserProgress /></ProtectedRoute>} />

            <Route path="/admin/contenido/temario" element={<ProtectedRoute><SyllabusManagement /></ProtectedRoute>} />
            <Route path="/admin/contenido/preguntas" element={<ProtectedRoute><ManageQuestions /></ProtectedRoute>} />
            <Route path="/admin/contenido/importador" element={<ProtectedRoute><ImportQuestions /></ProtectedRoute>} />
            <Route path="/admin/contenido/generador" element={<ProtectedRoute><AIQuestionGenerator /></ProtectedRoute>} />

            <Route path="/admin/web/guia-estudio" element={<ProtectedRoute><GuideEditor /></ProtectedRoute>} />
            <Route path="/admin/web/marketing" element={<ProtectedRoute><MarketingSettings /></ProtectedRoute>} />
            <Route path="/admin/web/avisos" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />

            <Route path="/admin/sistema/configuracion" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/sistema/logs" element={<ProtectedRoute><SystemLogs /></ProtectedRoute>} />
            <Route path="/admin/sistema/ai-usage" element={<ProtectedRoute><AIUsageDashboard /></ProtectedRoute>} />
            <Route path="/admin/simulacros" element={<ProtectedRoute><SimulacroManagement /></ProtectedRoute>} />

            <Route
              path="/simulacros"
              element={
                <ProtectedRoute>
                  <SimulacroList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tests"
              element={
                <ProtectedRoute>
                  <Tests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/test-session"
              element={
                <ProtectedRoute>
                  <TestSession />
                </ProtectedRoute>
              }
            />

            <Route
              path="/test-results/:attemptId"
              element={
                <ProtectedRoute>
                  <TestResults />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment/success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment/cancel"
              element={
                <ProtectedRoute>
                  <PaymentCancel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/baremo"
              element={
                <ProtectedRoute>
                  <BaremoPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ranking"
              element={
                <ProtectedRoute>
                  <RankingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#363636',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

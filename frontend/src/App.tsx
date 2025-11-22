import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MobileWarningBanner } from './components/MobileWarningBanner';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreatePlan } from './pages/CreatePlan';
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
import GenerateQuestions from './pages/GenerateQuestions';
import Tests from './pages/Tests';
import TestSession from './pages/TestSession';
import TestResults from './pages/TestResults';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentCancel } from './pages/PaymentCancel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Mobile Warning Banner - Shown globally */}
          <MobileWarningBanner />

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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

            <Route
              path="/admin/import-questions"
              element={
                <ProtectedRoute>
                  <ImportQuestions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/manage-questions"
              element={
                <ProtectedRoute>
                  <ManageQuestions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/generate-questions"
              element={
                <ProtectedRoute>
                  <GenerateQuestions />
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

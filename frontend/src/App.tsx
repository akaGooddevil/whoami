import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import BasicAuth from '@/pages/BasicAuth';
import DigestAuth from '@/pages/DigestAuth';
import Home from '@/pages/Home';

export default function App() {
    return (
        <Routes>
            <Route element={<AppShell/>}>
                <Route index element={<Home/>}/>
                <Route path="auth/basic" element={<BasicAuth/>}/>
                <Route path="auth/digest" element={<DigestAuth/>}/>
            </Route>
        </Routes>
    );
}

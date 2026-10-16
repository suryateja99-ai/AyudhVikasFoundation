import React from 'react';
import { ArrowLeft, ArrowRight, HeartHandshake, LockKeyhole } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import familyImage from '../assets/images/indian_family_hero_1785560495834.jpg';

interface Fund365ExploreProps {
  isMember: boolean;
  onRegister: (path?: string) => void;
  onSignIn: (path?: string) => void;
}

const pages = [
  ['/fund360/about', 'The concept'],
  ['/fund360/participation', 'Ways to participate'],
  ['/fund360/journey', 'Journey & benefits'],
];

const participation = [
  ['01', 'Annual participation', '₹365 / year', 'A single annual contribution. Think of it as ₹1 a day across the year, paid together.'],
  ['02', 'Monthly participation', '₹30 / month', 'Contribute monthly and maintain a continuous participation streak. This is a separate option from the ₹365 annual plan.'],
  ['03', 'Volunteer', 'Give your time', 'Express your interest in volunteering. The Foundation team coordinates opportunities with you; no financial contribution is required by default.'],
  ['04', 'Service + contribution', 'Service, with optional support', 'Offer a service and optionally contribute up to ₹365. Share your service details when you join.'],
];

export function Fund365Explore({ isMember, onRegister, onSignIn }: Fund365ExploreProps) {
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotion();
  const memberPath = ['/fund360/onboarding', '/fund360/dashboard', '/fund360/profile', '/fund360/finance', '/fund360/payments', '/fund360/milestones', '/fund360/benefits', '/fund360/history'].includes(pathname) ? pathname : '/fund360/onboarding';
  const section = pathname === '/fund360/participation' ? 'participation' : pathname === '/fund360/journey' ? 'journey' : 'about';
  const join = isMember ? <Link to="/fund360/onboarding" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800">Join Fund 365 <ArrowRight size={17} /></Link>
    : <button onClick={() => onRegister(memberPath)} className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800">Register with the Foundation <ArrowRight size={17} /></button>;

  return (
    <div className="min-h-screen bg-[#f8faf7] font-sans text-slate-900">
      <header className="border-b border-emerald-900/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" aria-label="Back to Ayudh Vikas Foundation" className="rounded-full p-2 text-emerald-900 hover:bg-emerald-50"><ArrowLeft size={20} /></Link>
            <Link to="/fund360/about" className="flex items-center gap-2 text-xl font-black tracking-tight text-emerald-900"><HeartHandshake size={26} /> FUND 365</Link>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span className="hidden text-slate-500 sm:inline">{isMember ? 'Foundation member' : 'Exploring as a visitor'}</span>
            {isMember ? <Link to="/fund360/dashboard" className="text-emerald-800 hover:underline">Member dashboard</Link> : <button onClick={() => onSignIn(memberPath)} className="text-emerald-800 hover:underline">Member sign in</button>}
          </div>
        </div>
      </header>

      <nav aria-label="Explore Fund 365" className="sticky top-0 z-20 border-b border-emerald-900/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-5 sm:px-8">
          {pages.map(([path, label]) => <NavLink key={path} to={path} aria-current={section === 'about' && pathname === '/fund360' && path === '/fund360/about' ? 'page' : undefined} className={({ isActive }) => `whitespace-nowrap border-b-2 py-4 text-sm font-bold transition-colors ${isActive || (pathname === '/fund360' && path === '/fund360/about') ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-emerald-800'}`}>{label}</NavLink>)}
          {isMember ? <>
            <Link to="/fund360/onboarding" className="whitespace-nowrap py-4 text-sm font-bold text-emerald-800">Change / Join</Link>
            <Link to="/fund360/profile" className="whitespace-nowrap py-4 text-sm font-bold text-emerald-800">Profile</Link>
          </> : <>
            <button onClick={() => onRegister('/fund360/onboarding')} className="inline-flex items-center gap-1.5 whitespace-nowrap py-4 text-sm font-bold text-emerald-800"><LockKeyhole size={14} /> Change / Join</button>
            <button onClick={() => onRegister('/fund360/profile')} className="inline-flex items-center gap-1.5 whitespace-nowrap py-4 text-sm font-bold text-emerald-800"><LockKeyhole size={14} /> Profile</button>
          </>}
        </div>
      </nav>

      <main>
        {!isMember && memberPath === pathname && <div className="mx-auto max-w-7xl px-5 py-5 text-sm leading-relaxed text-emerald-900 sm:px-8" role="status">This area is for registered Foundation members. <button onClick={() => onRegister(memberPath)} className="font-bold underline">Register</button> or <button onClick={() => onSignIn(memberPath)} className="font-bold underline">sign in</button> to continue. You can explore the programme below.</div>}
        {section === 'about' ? <>
          <section className="relative isolate flex min-h-[490px] items-center overflow-hidden bg-emerald-950 py-16 sm:min-h-[560px]">
            <img src={familyImage} alt="A family together, reflecting the community at the heart of Fund 365" className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_center]" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-950 via-emerald-950/85 to-emerald-950/30" />
            <motion.div initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto w-full max-w-7xl px-5 text-white sm:px-8">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Ayudh Vikas Foundation</p>
              <h1 className="text-6xl font-black tracking-tight sm:text-8xl">FUND 365</h1>
              <h2 className="mt-5 max-w-lg text-3xl font-semibold leading-tight sm:text-4xl">Small help, every day.<br />A community of care.</h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-emerald-50">A programme for steady contributions, volunteering and service in support of the Foundation’s community healthcare work.</p>
              <Link to="/fund360/participation" className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-bold text-emerald-950 transition-colors hover:bg-emerald-100">Explore how it works <ArrowRight size={18} /></Link>
              <p className="mt-4 text-xs text-emerald-100">Everyone can explore. No registration needed.</p>
            </motion.div>
          </section>
          <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1.3fr]">
            <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">The idea behind 365</p><h2 className="mt-4 text-3xl font-bold tracking-tight">A little, consistently.</h2></div>
            <div className="space-y-5 text-lg leading-relaxed text-slate-600"><p>The annual option brings together ₹365 for a year — the idea of ₹1 a day, contributed in one payment. You can also choose monthly participation, volunteering or service.</p><p>Your participation stays connected to your Ayudh Vikas Foundation account, where you can follow your contribution records, continuity and programme milestones.</p><Link to="/fund360/journey" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:underline">See the four-year journey <ArrowRight size={16} /></Link></div>
          </section>
        </> : section === 'participation' ? <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Ways to participate</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Choose how you can help.</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-slate-600">Explore the options here. When you’re ready, register with the Foundation or sign in to choose your participation path.</p>
          <div className="mt-12 border-t border-emerald-900/15">{participation.map(([number, title, amount, description]) => <article key={number} className="grid gap-3 border-b border-emerald-900/15 py-8 sm:grid-cols-[50px_1fr_1.2fr] sm:gap-6"><span className="text-sm font-bold text-emerald-700">{number}</span><div><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 font-semibold text-emerald-800">{amount}</p></div><p className="max-w-xl leading-relaxed text-slate-600">{description}</p></article>)}</div>
          <p className="mt-6 text-sm leading-relaxed text-slate-500">Contributions appear in your member records after verification. Volunteer and service participation are coordinated with the Foundation team.</p>
        </section> : <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Journey & benefits</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Continuity builds your journey.</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-slate-600">The programme follows a four-year path. Milestones depend on your participation history, required continuity and Foundation verification.</p>
          <ol className="mt-12 border-t border-emerald-900/15">{[
            ['Year 1', 'Begin your participation', 'Active Fund 365 member ID and selected health awareness resources.'],
            ['Year 2', 'Community appreciation', 'Birthday appreciation or community service in the participant’s name.'],
            ['Year 3', 'Preventive care', 'Health screening eligibility after the required continuity.'],
            ['Year 4', 'Recognition & support eligibility', 'A digital continuous-participation certificate and eligibility for applicable health insurance or assistance up to ₹1,00,000.'],
          ].map(([year, title, copy]) => <li key={year} className="grid gap-3 border-b border-emerald-900/15 py-8 sm:grid-cols-[100px_1fr_1.2fr] sm:gap-6"><span className="font-bold text-emerald-700">{year}</span><h2 className="text-xl font-bold">{title}</h2><p className="leading-relaxed text-slate-600">{copy}</p></li>)}</ol>
          <div className="mt-8 border-l-4 border-emerald-700 bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-950"><strong>Eligibility is subject to confirmation.</strong> Benefits are subject to programme eligibility, verification, provider or policy terms and availability. Participation does not guarantee insurance, screening or financial assistance. Your member area shows your individual status.</div>
          <div className="mt-12 space-y-5"><h2 className="text-2xl font-bold">Before you join</h2>{[
            ['Do I need an account to explore?', 'No. The concept, participation options and programme journey are open to everyone.'],
            ['When do I need to register?', 'Register with Ayudh Vikas Foundation to join, change participation, access your profile or view personal payments and history. Existing members can use their Foundation login.'],
            ['How is my progress tracked?', 'Your member area tracks recorded participation, verified contributions and milestones. Monthly participation is tracked as a continuous streak; benefit eligibility needs confirmation.'],
          ].map(([question, answer]) => <details key={question} className="border-b border-emerald-900/15 pb-5"><summary className="cursor-pointer text-base font-semibold text-emerald-900">{question}</summary><p className="mt-3 max-w-3xl leading-relaxed text-slate-600">{answer}</p></details>)}</div>
        </section>}

        <motion.section initial={reducedMotion ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="border-y border-emerald-900/10 bg-emerald-50">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 px-5 py-12 sm:px-8 md:flex-row md:items-center">
            <div className="max-w-xl"><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700"><LockKeyhole size={15} /> {isMember ? 'Your Foundation identity' : 'Ready to take part?'}</p><h2 className="text-2xl font-bold">{isMember ? 'Continue with your existing account.' : 'One Foundation account. Your own journey.'}</h2><p className="mt-3 leading-relaxed text-slate-600">Join or change participation, access your profile, and track your personal records through your Foundation account.</p></div>
            <div className="flex shrink-0 flex-col items-start gap-4">{join}{!isMember && <button onClick={() => onSignIn(memberPath)} className="text-sm font-semibold text-emerald-800 hover:underline">Already registered? Sign in</button>}</div>
          </div>
        </motion.section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-5 py-7 text-xs text-slate-500 sm:px-8"><span>FUND 365 · Ayudh Vikas Foundation</span><Link to="/" className="font-semibold text-emerald-800 hover:underline">Back to Foundation</Link></footer>
    </div>
  );
}

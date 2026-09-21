import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Wallet, Receipt, Users, Package } from 'lucide-react';
import { getMarket, renewMarket, updateMarket, getMarketNotes } from '../api/admin.api';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { StatTile } from '../components/StatTile';
import { PricingCard } from '../components/PricingCard';
import { PLAN_PRICES, PLAN_FEATURES } from '../data/plans';

function statusOf(market) {
  if (!market.active) return { tone: 'neutral', label: "O'chirilgan" };
  const daysLeft = (new Date(market.subscriptionExpiresAt) - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysLeft < 0) return { tone: 'danger', label: 'Muddati tugagan' };
  if (daysLeft < 5) return { tone: 'warning', label: `${Math.ceil(daysLeft)} kun qoldi` };
  return { tone: 'success', label: 'Faol' };
}

function formatMoney(n) {
  return `${n.toLocaleString()} so'm`;
}

export function AdminMarketDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);

  function reload() {
    setLoading(true);
    getMarket(id)
      .then(setData)
      .finally(() => setLoading(false));
  }

  useEffect(reload, [id]);

  useEffect(() => {
    setNotesLoading(true);
    getMarketNotes(id, { limit: 20 })
      .then((data) => setNotes(data.notes))
      .finally(() => setNotesLoading(false));
  }, [id]);

  async function handleRenew() {
    await renewMarket(id, 1);
    reload();
  }

  async function handleToggleActive() {
    await updateMarket(id, { active: !data.market.active });
    reload();
  }

  async function handleChangePlan(plan) {
    await updateMarket(id, { plan });
    reload();
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-brand-radial p-4 sm:p-8">
        <div className="mx-auto max-w-5xl text-base-content/50">Yuklanmoqda...</div>
      </div>
    );
  }

  const { market, owner, workersCount, activeWorkersCount, productsCount, totalRevenue, totalTransactions } = data;
  const status = statusOf(market);

  return (
    <div className="min-h-screen bg-brand-radial p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft size={14} /> Doʻkonlar
        </Link>

        <PageHeader
          title={market.name}
          subtitle={market.slug}
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleToggleActive}>
                {market.active ? "O'chirish" : 'Yoqish'}
              </Button>
              <Button onClick={handleRenew}>+1 oy uzaytirish</Button>
            </div>
          }
        />

        <div className="mb-6 flex items-center gap-3">
          <Badge tone={status.tone}>{status.label}</Badge>
          <span className="text-sm text-base-content/60">
            Obuna: {new Date(market.subscriptionExpiresAt).toLocaleDateString('uz-UZ')}
          </span>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile
            label="Jami daromad"
            value={totalRevenue}
            format={(n) => formatMoney(Math.round(n))}
            icon={Wallet}
            accent
          />
          <StatTile label="Savdolar soni" value={totalTransactions} icon={Receipt} />
          <StatTile
            label="Xodimlar"
            value={workersCount}
            format={(n) => `${Math.round(n)} (${activeWorkersCount} faol)`}
            icon={Users}
          />
          <StatTile label="Mahsulotlar" value={productsCount} icon={Package} />
        </div>

        <div className="mb-6">
          <h2 className="mb-3 font-heading text-base font-semibold">Obuna rejasi</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PricingCard
              title="Oddiy"
              price={PLAN_PRICES.starter}
              features={PLAN_FEATURES.starter}
              active={market.plan !== 'pro'}
              actionLabel="Oddiy rejaga o'tkazish"
              onSelect={() => handleChangePlan('starter')}
            />
            <PricingCard
              title="Pro"
              price={PLAN_PRICES.pro}
              features={PLAN_FEATURES.pro}
              highlight
              active={market.plan === 'pro'}
              actionLabel="Pro rejaga o'tkazish"
              onSelect={() => handleChangePlan('pro')}
            />
          </div>
        </div>

        <div className="mb-6 rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="mb-3 font-heading text-base font-semibold">Doʻkon egasi</h2>
          {owner ? (
            <div className="text-sm">
              <div className="font-medium">{owner.name}</div>
              <div className="text-base-content/60">Login: {owner.username}</div>
              <div className="text-base-content/40">
                Roʻyxatdan oʻtgan: {new Date(owner.createdAt).toLocaleDateString('uz-UZ')}
              </div>
            </div>
          ) : (
            <p className="text-sm text-base-content/50">Egasi topilmadi.</p>
          )}
        </div>

        <div className="rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="mb-3 font-heading text-base font-semibold">Eslatmalar</h2>
          {notesLoading && <p className="text-sm text-base-content/50">Yuklanmoqda...</p>}
          {!notesLoading && notes.length === 0 && (
            <p className="text-sm text-base-content/50">Hali eslatma yoʻq.</p>
          )}
          {!notesLoading && notes.length > 0 && (
            <ul className="flex flex-col gap-3">
              {notes.map((note) => (
                <li key={note._id} className="flex items-start gap-3 rounded-field border border-base-300 p-3">
                  <Badge tone={note.type === 'flag' ? 'danger' : 'neutral'}>
                    {note.type === 'flag' ? 'Bildirishnoma' : 'Kunlik'}
                  </Badge>
                  <div className="flex-1 text-sm">
                    <p>{note.text}</p>
                    <p className="mt-1 text-xs text-base-content/40">
                      {new Date(note.createdAt).toLocaleString('uz-UZ')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

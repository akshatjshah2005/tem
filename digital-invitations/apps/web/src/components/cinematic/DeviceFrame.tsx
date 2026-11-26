import './cinematic.css';
import Icon from '@/components/ui/Icon';

export type DeviceView = 'phone' | 'tablet' | 'web';

export const DEVICE_VIEWS: { id: DeviceView; label: string; icon: 'phone' | 'tablet' | 'monitor' }[] = [
  { id: 'phone', label: 'Mobile', icon: 'phone' },
  { id: 'tablet', label: 'Tablet', icon: 'tablet' },
  { id: 'web', label: 'Web', icon: 'monitor' },
];

export default function DeviceFrame({ view, children }: { view: DeviceView; children: React.ReactNode }) {
  return (
    <div className="cdev" data-view={view}>
      {view === 'web' && <div className="cdev-bar" aria-hidden="true"><i /><i /><i /><span>uptemp.in/i/your-invitation</span></div>}
      <div className="cdev-screen">{children}</div>
    </div>
  );
}

export function DeviceToggle({ view, onChange }: { view: DeviceView; onChange: (v: DeviceView) => void }) {
  return (
    <div className="cdev-toggle" role="group" aria-label="Preview size">
      {DEVICE_VIEWS.map((v) => (
        <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => onChange(v.id)}>
          <Icon name={v.icon} /> <span>{v.label}</span>
        </button>
      ))}
    </div>
  );
}

import { RoleDto } from '@task-management/dto';

interface RoleCardProps {
  role: RoleDto;
  onClick?: () => void;
}

export function RoleCard({ role, onClick }: RoleCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-teal-500/50 transition-all ${
        onClick ? 'cursor-pointer hover:bg-gray-800/80' : ''
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {role.name}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              role.name === 'superadmin'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : role.name === 'responder'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-gray-700 text-gray-300 border border-gray-600'
            }`}
          >
            Level {role.hierarchy}
          </span>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-400">
            <strong className="text-gray-300">Permissions:</strong> {role.permissions.length}
          </div>
          {role.permissions.length > 0 && (
            <div className="text-xs text-gray-500 max-h-32 overflow-y-auto space-y-1">
              {role.permissions.map((perm: any, idx: number) => (
                <div key={idx} className="py-1 border-b border-gray-700 last:border-0">
                  {perm.resource === '*' ? (
                    <span className="font-medium text-teal-400">All Resources</span>
                  ) : (
                    <span className="text-gray-400">
                      {perm.resource}: {Array.isArray(perm.actions) ? perm.actions.join(', ') : perm.actions}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


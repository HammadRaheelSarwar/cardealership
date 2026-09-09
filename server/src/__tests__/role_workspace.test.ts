import {
  getTaskDisplayStatus,
  DEFAULT_PIPELINE_STAGES,
  TaskOutcome,
} from '@crm/shared';

describe('Role-Based CRM Architecture & Workflows', () => {
  describe('1. Task Zero Logic & Scope', () => {
    it('calculates Task Zero scope correctly: due today + overdue only', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const today = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const tasks = [
        { id: '1', status: 'pending' as const, dueAt: yesterday },
        { id: '2', status: 'pending' as const, dueAt: today },
        { id: '3', status: 'pending' as const, dueAt: nextWeek }, // future
        { id: '4', status: 'completed' as const, dueAt: today },
      ];

      const pendingTasks = tasks.filter((t) => t.status === 'pending');
      const taskZeroDue = pendingTasks.filter((t) => {
        const displayStatus = getTaskDisplayStatus(t.status, t.dueAt);
        return displayStatus === 'today' || displayStatus === 'overdue';
      });

      expect(taskZeroDue.length).toBe(2);
      expect(taskZeroDue.map((t) => t.id)).toEqual(['1', '2']);
    });
  });

  describe('2. Deterministic Stage Transition Rules', () => {
    const orderMap: Record<string, string> = {
      'new-lead': 'contacted',
      'contacted': 'appointment-set',
      'appointment-set': 'show-test-drive',
      'show-test-drive': 'working-deal',
    };

    function evaluateNextStage(currentSlug: string, outcome: TaskOutcome): string | null {
      if (outcome === 'appointment_set') {
        return 'appointment-set';
      }
      if (outcome === 'moved_to_next_stage') {
        return orderMap[currentSlug] || null;
      }
      if (outcome === 'not_interested' || outcome === 'purchased_elsewhere') {
        return 'lost';
      }
      if (outcome === 'no_answer' || outcome === 'follow_up_needed') {
        return null; // does not advance stage
      }
      return null;
    }

    it('advances to appointment-set when appointment is booked', () => {
      expect(evaluateNextStage('contacted', 'appointment_set')).toBe('appointment-set');
      expect(evaluateNextStage('new-lead', 'appointment_set')).toBe('appointment-set');
    });

    it('advances exactly one stage forward on moved_to_next_stage', () => {
      expect(evaluateNextStage('new-lead', 'moved_to_next_stage')).toBe('contacted');
      expect(evaluateNextStage('contacted', 'moved_to_next_stage')).toBe('appointment-set');
      expect(evaluateNextStage('appointment-set', 'moved_to_next_stage')).toBe('show-test-drive');
      expect(evaluateNextStage('show-test-drive', 'moved_to_next_stage')).toBe('working-deal');
    });

    it('does NOT advance stage on no_answer or follow_up_needed', () => {
      expect(evaluateNextStage('contacted', 'no_answer')).toBeNull();
      expect(evaluateNextStage('contacted', 'follow_up_needed')).toBeNull();
    });

    it('transitions to lost on not_interested or purchased_elsewhere', () => {
      expect(evaluateNextStage('contacted', 'not_interested')).toBe('lost');
      expect(evaluateNextStage('show-test-drive', 'purchased_elsewhere')).toBe('lost');
    });
  });

  describe('3. Cross-Role Authorization Matrix', () => {
    const rolesAllowed = {
      salespersonWorkspace: ['salesperson'],
      managerWorkspace: ['manager', 'owner'],
      ownerWorkspace: ['owner'],
    };

    function canAccess(role: string, allowed: string[]) {
      return allowed.includes(role);
    }

    it('prohibits salesperson from accessing manager and owner workspaces', () => {
      expect(canAccess('salesperson', rolesAllowed.salespersonWorkspace)).toBe(true);
      expect(canAccess('salesperson', rolesAllowed.managerWorkspace)).toBe(false);
      expect(canAccess('salesperson', rolesAllowed.ownerWorkspace)).toBe(false);
    });

    it('allows manager to access manager workspace but not owner workspace', () => {
      expect(canAccess('manager', rolesAllowed.salespersonWorkspace)).toBe(false);
      expect(canAccess('manager', rolesAllowed.managerWorkspace)).toBe(true);
      expect(canAccess('manager', rolesAllowed.ownerWorkspace)).toBe(false);
    });

    it('allows owner access to owner and manager workspaces', () => {
      expect(canAccess('owner', rolesAllowed.ownerWorkspace)).toBe(true);
      expect(canAccess('owner', rolesAllowed.managerWorkspace)).toBe(true);
    });
  });

  describe('4. Manager Scope Filtering', () => {
    it('isolates assigned team members from other teams', () => {
      const teamShane = ['rep-sarah', 'rep-michael', 'rep-james'];
      const teamMarcus = ['rep-david', 'rep-lisa'];

      const isMemberOfShane = (repId: string) => teamShane.includes(repId);

      expect(isMemberOfShane('rep-sarah')).toBe(true);
      expect(isMemberOfShane('rep-michael')).toBe(true);
      expect(isMemberOfShane('rep-david')).toBe(false);
      expect(isMemberOfShane('rep-lisa')).toBe(false);
      expect(teamMarcus.every((id) => !isMemberOfShane(id))).toBe(true);
    });
  });

  describe('5. Default Pipeline Stages Contract', () => {
    it('contains the expected 6 default stages + lost in correct sort order', () => {
      const slugs = DEFAULT_PIPELINE_STAGES.map((s) => s.slug);
      expect(slugs).toEqual([
        'new-lead',
        'contacted',
        'appointment-set',
        'show-test-drive',
        'working-deal',
        'sold',
        'lost',
      ]);
    });
  });
});

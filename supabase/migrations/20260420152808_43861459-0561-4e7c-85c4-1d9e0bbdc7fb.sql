DO $$
DECLARE
  pid UUID := '96c473ca-3367-4676-b98f-b6406d63549d';
BEGIN
  UPDATE tickets SET group_id = NULL WHERE project_id = pid;
  DELETE FROM ticket_groups WHERE project_id = pid;

  INSERT INTO ticket_groups (project_id, label, sort_order, color, description) VALUES
    (pid, 'Backend (Spring Boot)', 0, '#22c55e', 'Backend APIs, entities, STOMP, fiscal — BE-* tickets'),
    (pid, 'KDS (Kitchen Display)', 1, '#a855f7', 'Kitchen Display System Flutter app — KDS-* tickets'),
    (pid, 'Caisse (POS App)',     2, '#f97316', 'Caisse / POS Flutter app — CAI-* tickets'),
    (pid, 'Owner App',             3, '#06b6d4', 'Owner mobile app — OWN-* tickets'),
    (pid, 'Infrastructure',        4, '#facc15', 'Config, auth, deployment — INF-* tickets');

  UPDATE tickets t SET group_id = g.id
  FROM ticket_groups g
  WHERE t.project_id = pid AND g.project_id = pid
    AND (
      (split_part(t.code,'-',1) = 'BE'  AND g.label = 'Backend (Spring Boot)') OR
      (split_part(t.code,'-',1) = 'KDS' AND g.label = 'KDS (Kitchen Display)') OR
      (split_part(t.code,'-',1) = 'CAI' AND g.label = 'Caisse (POS App)') OR
      (split_part(t.code,'-',1) = 'OWN' AND g.label = 'Owner App') OR
      (split_part(t.code,'-',1) = 'INF' AND g.label = 'Infrastructure')
    );
END $$;
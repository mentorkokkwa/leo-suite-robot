# Leo Suite · CampusBot AI

[mentorkokkwa](https://github.com/mentorkokkwa) · [YouthMentor](https://github.com/mentorkokkwa/leo-suite-growth) · [EduLens](https://github.com/mentorkokkwa/leo-suite-edutech) · [Suite docs](https://github.com/mentorkokkwa/leo-suite)

School service robot navigation and task execution simulator.

## Features

- **School map simulator** — Staff room, classrooms, library, office, auditorium, gate, corridors, restricted zones, obstacles, moving students
- **Task planner** — Worksheet delivery, visitor guide, library book return, document delivery
- **Navigation engine** — Real A* path planning, obstacle detection, dynamic re-planning, safety rules
- **Metrics & report** — Path length, time steps, collisions, re-plans, decision log, simulation report

## Pages

| Route | Description |
|-------|-------------|
| `/campusbot` | Product home |
| `/campusbot/simulator` | Live robotics control dashboard |
| `/campusbot/maps` | Map and location reference |
| `/campusbot/tasks` | Task definitions |
| `/campusbot/experiments` | Three demo scenarios |
| `/campusbot/report` | Post-simulation report |

## Demo scenarios

1. **Worksheet delivery** — Staff room → Classroom 4A (dynamic student in corridor)
2. **Visitor guide** — School gate → Auditorium (crowded path, restricted zone)
3. **Library book return** — Counter → Shelf zone (narrow path, static obstacles)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3002/campusbot](http://localhost:3002/campusbot).

## Build

```bash
npm run build
npm start
```

## Future hardware (not implemented)

- Arduino / Raspberry Pi motor control
- Camera-based obstacle detection
- ROS2 integration
- Indoor localisation
- Real robot teleoperation interface

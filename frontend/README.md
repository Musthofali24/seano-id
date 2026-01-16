# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

cd /home/seanoadmin/seano-id && docker compose exec db psql -U appuser -d appdb -c "INSERT INTO vehicles (code, name, description, status, user_id, created_at, updated_at) VALUES ('USV-001', 'USV 001', 'Unmanned Surface Vehicle 001', 'active', 2, NOW(), NOW()) RETURNING id, code, name, user_id;"

cd /home/seanoadmin/seano-id && docker compose exec db psql -U appuser -d appdb -c "INSERT INTO sensors (brand, model, code, sensor_type_id, description, is_active, created_at, updated_at) VALUES ('GPS', 'Standard GPS', 'GPS-001', 5, 'GPS Navigation Sensor', true, NOW(), NOW()) RETURNING id, code, brand, model, sensor_type_id;"
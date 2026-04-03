# Deploy Railway

Project nay da san sang de deploy len Railway.

## 1. Day code len GitHub

- Tao repo moi tren GitHub.
- Day toan bo thu muc project len repo do.

## 2. Tao service tren Railway

- Vao Railway.
- Chon `New Project`.
- Chon `Deploy from GitHub repo`.
- Chon repo cua ban.

## 3. Tao volume de luu du lieu

- Trong project Railway, tao `Volume`.
- Mount vao duong dan:

`/app/data`

Du lieu admin, user, so du va cau hinh se duoc luu o day.

## 4. Them bien moi truong

Them cac bien sau:

- `DATA_DIR=/app/data`
- `HOST=0.0.0.0`
- `PORT=3000`

## 5. Lay link

Sau khi deploy xong:

- Web chinh: `https://ten-app-cua-ban.up.railway.app`
- Web admin: `https://ten-app-cua-ban.up.railway.app/admin.html`

## 6. Kiem tra nhanh

- Mo `/health`
- Mo `/admin.html`
- Mo `index.html`

Neu vao duoc 3 link nay la on.

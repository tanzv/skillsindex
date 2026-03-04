export const globalLoginStylesInfoCards = `
.login-info-hero {
  width: 100%;
  min-height: 176px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.05)),
    rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-info-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.94;
}

.login-info-points {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  color: rgba(245, 245, 245, 0.82);
  font-size: 12px;
  line-height: 1.5;
  display: grid;
  gap: 8px;
}

.login-info-points li {
  margin: 0;
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  align-items: flex-start;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  color: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  padding: 8px 10px;
}

.login-info-point-icon {
  width: 8px;
  height: 8px;
  margin-top: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12);
}
`;

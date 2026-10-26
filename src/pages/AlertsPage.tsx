import { useState } from "react";
import { Link } from "react-router-dom";

import { Alert, api } from "../api";
import { Message } from "../components/Message";
import { Pagination } from "../components/Pagination";
import { Price } from "../components/Price";
import { useToast } from "../components/Toast";
import { formatDate, shopifyImage, sizeLabel } from "../format";
import { useLoad } from "../useLoad";

const PAGE_SIZE = 48;

export default function AlertsPage() {
  const [page, setPage] = useState(1);
  const alerts = useLoad(() => api.alerts(page), [page]);
  const toast = useToast();

  async function remove(alert: Alert) {
    try {
      await api.cancelAlert(alert.id);
      alerts.setData((data) =>
        data && { ...data, total: data.total - 1, items: data.items.filter((a) => a.id !== alert.id) },
      );
      toast(alert.status === "active" ? "Alert cancelled" : "Alert removed");
    } catch (e) {
      toast((e as Error).message);
    }
  }

  return (
    <>
      <h1>Restock alerts</h1>
      <p className="muted">
        Alerts are checked once a day, after the night's data update. You get a Telegram message when a watched size is
        back in stock.
      </p>
      {alerts.error && <Message title="Could not load alerts" text={alerts.error} />}
      {!alerts.data && !alerts.error && <Message title="Loading…" />}
      {alerts.data && alerts.data.items.length === 0 && (
        <Message title="No alerts yet" text="Open a product and tap “Alert me” on a sold-out size." />
      )}
      {alerts.data && alerts.data.items.length > 0 && (
        <>
          <ul className="alert-list">
            {alerts.data.items.map((a) => (
              <li key={a.id} className="alert-row">
                <Link to={`/products/${a.product_id}`} className="alert-image">
                  {a.image_url ? <img src={shopifyImage(a.image_url, 200)} alt="" loading="lazy" /> : null}
                </Link>
                <div className="alert-info">
                  <Link to={`/products/${a.product_id}`} className="card-title">
                    {a.product_title}
                  </Link>
                  <span className="muted">
                    {a.brand_name} · Size {sizeLabel({ size_norm: a.size_norm, title: a.variant_title })}
                  </span>
                  <Price price={a.price} compareAt={a.compare_at_price} discount={a.discount_pct} />
                </div>
                <div className="alert-side">
                  {a.status === "active" ? (
                    <span className="status status-active">Waiting for restock</span>
                  ) : (
                    <span className="status status-fired">Back in stock · {formatDate(a.last_fired_at)}</span>
                  )}
                  <div className="alert-buttons">
                    {a.status === "fired" && (
                      <a className="button" href={a.url} target="_blank" rel="noopener noreferrer">
                        Buy ↗
                      </a>
                    )}
                    <button type="button" className="button button-secondary" onClick={() => remove(a)}>
                      {a.status === "active" ? "Cancel" : "Remove"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={page} pageSize={PAGE_SIZE} total={alerts.data.total} onPage={setPage} />
        </>
      )}
    </>
  );
}

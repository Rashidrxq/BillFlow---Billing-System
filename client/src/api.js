const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

async function handleResponse(response) {
  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage = payload?.error || payload?.message || text || `Server responded with ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload;
}

export async function getProducts() {
  return (await handleResponse(await fetch(`${API_BASE}/products`))) || [];
}

export async function createProduct(product) {
  return handleResponse(
    await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })
  );
}

export async function removeProduct(id) {
  return handleResponse(
    await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    })
  );
}

export async function recordPurchase(purchase) {
  return handleResponse(
    await fetch(`${API_BASE}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchase),
    })
  );
}

export async function createInvoice(invoice) {
  return handleResponse(
    await fetch(`${API_BASE}/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    })
  );
}

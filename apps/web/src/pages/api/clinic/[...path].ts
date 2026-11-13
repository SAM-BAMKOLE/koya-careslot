import type { APIRoute } from "astro"

export const prerender = false

const proxy: APIRoute = async ({ request, params, url }) => {
  const baseUrl = import.meta.env.CLINIC_API_URL
  const apiKey = import.meta.env.CLINIC_API_KEY
  const keyHeader = import.meta.env.CLINIC_API_KEY_HEADER || "x-api-key"

  if (!baseUrl || !apiKey) {
    return Response.json(
      { message: "Clinic API is not configured." },
      { status: 503 }
    )
  }

  const path = params.path

  if (!path) {
    return Response.json({ message: "Invalid API path." }, { status: 400 })
  }

  const target = new URL(
    path.split("/").map(encodeURIComponent).join("/"),
    baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  )

  target.search = url.search

  const headers = new Headers()

  const contentType = request.headers.get("content-type")

  if (contentType) {
    headers.set("content-type", contentType)
  }

  headers.set(keyHeader, apiKey)
  headers.set("accept", "application/json")

  // Forward only the idempotency header.
  const idempotencyKey = request.headers.get("Idempotency-Key")

  if (idempotencyKey) {
    headers.set("Idempotency-Key", idempotencyKey)
  }

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method)
        ? undefined
        : await request.arrayBuffer(),
      redirect: "manual",
    })

    const responseHeaders = new Headers()

    for (const name of ["content-type", "retry-after", "cache-control"]) {
      const value = response.headers.get(name)
      if (value) responseHeaders.set(name, value)
    }

    responseHeaders.set("Cache-Control", "no-store")

    return new Response(request.method === "HEAD" ? null : response.body, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch {
    return Response.json(
      { message: "The clinic booking service is unavailable." },
      { status: 502 }
    )
  }
}

export const GET = proxy
export const POST = proxy
export const DELETE = proxy
export const PATCH = proxy
export const PUT = proxy

import type express from "express"
import request from "supertest"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

// Use in-memory DB by setting env before importing app if needed. Here app imports db on load,
// so to ensure in-memory for tests, we recreate an isolated app instance by temporarily setting env.

describe("Bookings API", () => {
  const originalDbFile = process.env.DB_FILE
  let app: express.Express
  beforeAll(async () => {
    process.env.DB_FILE = ":memory:"
    const mod = await import("../src/app.js")
    app = mod.default as unknown as express.Express
  })
  afterAll(() => {
    if (originalDbFile !== undefined) process.env.DB_FILE = originalDbFile
    else delete process.env.DB_FILE
  })

  it("creates a booking and lists it", async () => {
    const date = "2030-01-01"
    const created = await request(app)
      .post("/api/bookings")
      .send({ date, name: "Alice" })
      .expect(201)
    expect(created.body).toMatchObject({ date, name: "Alice" })

    const list = await request(app)
      .get("/api/bookings")
      .query({ from: date, to: date })
      .expect(200)
    expect(list.body).toHaveLength(1)
    expect(list.body[0]).toMatchObject({ date, name: "Alice" })
  })

  it("prevents double booking", async () => {
    const date = "2030-02-02"
    await request(app).post("/api/bookings").send({ date }).expect(201)
    const dup = await request(app)
      .post("/api/bookings")
      .send({ date })
      .expect(409)
    expect(dup.body).toEqual({ message: "Date already booked" })
  })

  it("validates request payloads and query", async () => {
    await request(app).post("/api/bookings").send({ date: "bad" }).expect(400)
    await request(app)
      .get("/api/bookings")
      .query({ from: "2020-01-01", to: "bad" })
      .expect(400)
  })
})

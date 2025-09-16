import type express from "express"
import request from "supertest"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

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

    const list = await request(app).get("/api/bookings").query({ from: date, to: date }).expect(200)
    expect(list.body).toHaveLength(1)
    expect(list.body[0]).toMatchObject({ date, name: "Alice" })
  })

  it("prevents double booking", async () => {
    const date = "2030-02-02"
    await request(app).post("/api/bookings").send({ date }).expect(201)
    const dup = await request(app).post("/api/bookings").send({ date }).expect(409)
    expect(dup.body).toEqual({ message: "Date already booked" })
  })

  it("validates request payloads and query", async () => {
    await request(app).post("/api/bookings").send({ date: "bad" }).expect(400)
    await request(app).get("/api/bookings").query({ from: "2020-01-01", to: "bad" }).expect(400)
  })

  it("deletes a booking by ID", async () => {
    const date = "2030-03-03"
    const created = await request(app).post("/api/bookings").send({ date, name: "Bob" }).expect(201)

    await request(app).delete(`/api/bookings/${created.body.id}`).expect(204)

    const list = await request(app).get("/api/bookings").query({ from: date, to: date }).expect(200)
    expect(list.body).toHaveLength(0)
  })

  it("returns 204 when deleting non-existent booking (idempotent)", async () => {
    await request(app).delete("/api/bookings/99999").expect(204)
  })

  it("returns 400 for invalid booking ID", async () => {
    const response = await request(app).delete("/api/bookings/invalid").expect(400)
    expect(response.body).toEqual({ message: "Invalid booking ID" })
  })

  it("returns 400 for invalid range date", async () => {
    const from = "2030-04-04"
    const to = "2030-05-05"

    const responseFrom = await request(app)
      .get("/api/bookings")
      .query({ from: "invalid", to })
      .expect(400)
    expect(responseFrom.body).toEqual({ message: "from must be YYYY-MM-DD" })

    const responseTo = await request(app)
      .get("/api/bookings")
      .query({ from, to: "invalid" })
      .expect(400)
    expect(responseTo.body).toEqual({ message: "to must be YYYY-MM-DD" })
  })
})

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { task: { update: vi.fn() } },
}));

vi.mock("../lib/prisma.js", () => ({ prisma: prismaMock }));

const { updateTaskTitle } = await import("./tasks.controller.js");

function mockResponse() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

describe("updateTaskTitle", () => {
  beforeEach(() => {
    prismaMock.task.update.mockReset();
  });

  it("updates the title and returns the updated task", async () => {
    const updatedTask = { id: 1, title: "New title", status: "OPEN" };
    prismaMock.task.update.mockResolvedValue(updatedTask);
    const req = { params: { id: "1" }, body: { title: "New title" } } as unknown as Request;
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await updateTaskTitle(req, res, next);

    expect(prismaMock.task.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { title: "New title" } });
    expect(res.json).toHaveBeenCalledWith(updatedTask);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an empty title with a 400 error and does not touch the database", async () => {
    const req = { params: { id: "1" }, body: { title: "" } } as unknown as Request;
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await updateTaskTitle(req, res, next);

    expect(prismaMock.task.update).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it("returns a 404 error for a non-numeric id", async () => {
    const req = { params: { id: "abc" }, body: { title: "New title" } } as unknown as Request;
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await updateTaskTitle(req, res, next);

    expect(prismaMock.task.update).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("returns a 404 error when the task doesn't exist", async () => {
    prismaMock.task.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Not found", { code: "P2025", clientVersion: "6.19.3" })
    );
    const req = { params: { id: "999" }, body: { title: "New title" } } as unknown as Request;
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await updateTaskTitle(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });
});

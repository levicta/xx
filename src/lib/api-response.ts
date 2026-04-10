import { NextResponse } from "next/server"

export type ApiErrorCode = 
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST"

export interface ApiError {
  error: string
  code: ApiErrorCode
  details?: Record<string, string[]>
}

export interface ApiSuccess<T> {
  data: T
  message?: string
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json(
    { error: message, code: "UNAUTHORIZED" as ApiErrorCode },
    { status: 401 }
  )
}

export function forbidden(message = "Access denied") {
  return NextResponse.json(
    { error: message, code: "FORBIDDEN" as ApiErrorCode },
    { status: 403 }
  )
}

export function notFound(message = "Resource not found") {
  return NextResponse.json(
    { error: message, code: "NOT_FOUND" as ApiErrorCode },
    { status: 404 }
  )
}

export function validationError(message: string, details?: Record<string, string[]>) {
  return NextResponse.json(
    { error: message, code: "VALIDATION_ERROR" as ApiErrorCode, details },
    { status: 400 }
  )
}

export function badRequest(message = "Bad request") {
  return NextResponse.json(
    { error: message, code: "BAD_REQUEST" as ApiErrorCode },
    { status: 400 }
  )
}

export function internalError(message = "Internal server error", error?: unknown) {
  if (error) {
    console.error("API Error:", error)
  }
  return NextResponse.json(
    { error: message, code: "INTERNAL_ERROR" as ApiErrorCode },
    { status: 500 }
  )
}

export function success<T>(data: T, message?: string) {
  return NextResponse.json({ data, message })
}
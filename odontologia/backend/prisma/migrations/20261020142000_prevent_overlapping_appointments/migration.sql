ALTER TABLE "Appointment"
ADD CONSTRAINT "appointment_valid_interval"
CHECK ("endAt" > "startAt");

ALTER TABLE "Appointment"
ADD CONSTRAINT "appointment_no_overlap"
EXCLUDE USING gist (
  tsrange("startAt", "endAt", '[)') WITH &&
)
WHERE ("status" = 'confirmed');

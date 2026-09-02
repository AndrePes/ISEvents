app.storageQueue("processBookingRequest", {
  queueName: "booking-request-processing",
  connection: "AzureWebJobsStorage",
  handler: processBookingRequest
});

interface BookingQueueMessage {
  bookingRequestId: string;
}

const { data: bookingRequest } =
  await supabase
    .from("BookingRequests")
    .select("*")
    .eq("id", bookingRequestId)
    .single();

await supabase
  .from("BookingRequests")
  .update({
    processing_status: "Processing"
  })
  .eq("id", bookingRequestId);
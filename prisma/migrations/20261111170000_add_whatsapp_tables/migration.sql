-- CreateTable
CREATE TABLE IF NOT EXISTS "whatsapp_conversations" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT,
    "lead_name" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "assigned_caller" VARCHAR(100),
    "last_message_text" TEXT,
    "last_message_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "whatsapp_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_type" VARCHAR(20) NOT NULL DEFAULT 'OUTBOUND',
    "sender_name" VARCHAR(100),
    "text" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'SENT',
    "wa_message_id" VARCHAR(150),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_wa_conversations_phone" ON "whatsapp_conversations"("phone_number");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_wa_conversations_lead_id" ON "whatsapp_conversations"("lead_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_wa_conversations_assigned" ON "whatsapp_conversations"("assigned_caller");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_wa_messages_conversation_id" ON "whatsapp_messages"("conversation_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_wa_messages_wamid" ON "whatsapp_messages"("wa_message_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_conversations_lead_id_fkey'
    ) THEN
        ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_messages_conversation_id_fkey'
    ) THEN
        ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "whatsapp_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


承知いたしました。PDF関連プログラムの仕様書を以下に提示します。
**Assessing the Task**

I'm parsing the user's request. It's about generating SQL schemas with Japanese comments. The core input is a series of `CREATE TABLE` statements. Each table includes columns, data types, and constraints. I need to understand the structure of these statements thoroughly.


**Interpreting the Request**

I'm currently focusing on the "asset\_details" table. My analysis involves understanding the purpose of each column within this table. I need to draft concise Japanese comments that clearly explain what each attribute represents, keeping in mind the user's requirement for informative, accessible explanations.


**Structuring the Approach**

I've analyzed the structure of the "asset\_details" table and will proceed with the "audit\_documents" table. I am now translating each column's purpose into clear Japanese, aiming for conciseness. The use of SQL standard comments `--` will be the standard. I'll also pay close attention to foreign keys, primary keys, and defaults for clear annotations.


**Formulating Japanese Comments**

I'm in the process of writing Japanese comments for the `audit_documents` table. I've translated the purpose of the columns, ensuring clarity and accuracy. I'm paying special attention to the foreign key relationship to the `organization_report_id`. Also, I'm planning to comment the table for the overall purpose.


**Refining the Approach**

I'm now analyzing the `chat_messages` table and its related columns, such as `session_id`, `message_type`, and `content`. I'm strategizing the best ways to comment on the use of JSON for the `source_documents` column. Following this, I plan to comment on the overall purpose of the table, including its relation to AI functions.


**Adding the Japanese Comments**

I'm now working on the `diet_members` table, focusing on the `party_id` column and its foreign key relationship. Also, I plan to analyze the `elected_at` column and add a comment. I'm looking at the tables, with an eye on primary keys. I will now move onto the `document_embeddings` table, focusing on explaining its AI-related columns.


**Generating the Japanese Comments**

I'm now analyzing the `chat_sessions` table and its design to comment on the columns. I will examine the `session_name` column and how it relates to the overall purpose of the table. Then I will move on to comment the `diet_members` table.


**Elaborating the Strategy**

I'm currently detailing the structure of the `CREATE TABLE` statements to understand the relationships between tables. The next step is to comment on the `donations` table, by translating each column and the table purpose into Japanese. I will continue by reviewing the relationship with the `revenue_details` table, to further refine the comments.


**Implementing the Comments**

I'm now adding comments to the `entities` table. I'll analyze each column, translating the name and function into Japanese, and considering its relationship to the overall data model. Next I will move on to comment on the `expenditure_details` table, for each of the columns.


**Finalizing the Comments**

I'm now adding the comments to the `financial_summaries` table. I'm analyzing the `prev_year_balance` to ensure accuracy, and making sure the comments clearly define its purpose. Next, I will move on to the `fund_flows` table and work on the overall purpose.


**Evaluating Tables and Columns**

I'm now reviewing the `fund_management_organizations` table to provide Japanese comments. I'll analyze the columns, focusing on the `organization_name` and the overall relationship to `politician_id`. Then, I will review the `monitored_documents` table.


**Adding Political Organization Tables**

I'm now commenting on the `political_funds` table, examining columns such as `affiliated_party`. Also, I will analyze the relationship with the `representative_id`. Next, I am going to comment the `political_funds_organizations` table.


**Refining Table Definitions**

I'm now working on the `political_parties` table, focusing on commenting each column to make the SQL schema more understandable for the user. I'm working on the comments for both the name and the headquarters address. I will also work on the overall structure, keeping in mind the balance sheet information columns, total income, total expenditure, and net balance.


**Adding Further Details**

I've completed the `political_parties` table comments. Now, I am moving on to the `politicians` table, which contains details of politicians. This involves analyzing columns such as name, and party affiliation to craft accurate and informative Japanese comments.


**Commenting the Database**

I've completed the `politicians` table and am now focused on reviewing my comments. I'm revisiting my translation of the columns, checking their accuracy and readability. I'm making adjustments as I go, focusing on clarity and conciseness to ensure the user gets the most relevant information.


**Adding Overall Table Descriptions**

I've finished adding comments to the `politicians` table, covering each column. Now, I'll start reviewing the other tables, ensuring the overall table purpose is clear. My goal is to provide a complete, and well-commented database schema for the user.


**Evaluating the Database**

I'm now reviewing the comment on the `recipients` table. Next, I'll add a comment on the `revenue_details` table, including a description. Then, I'll comment on the `system_logs` table to document the purpose.


はい、承知いたしました。以下に、指定されたすべてのCREATE TABLE文に日本語のコメントを追加したスキーマ定義を記載します。

```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- 警告: このスキーマは文脈理解のためだけのものであり、実行を意図したものではありません。
-- Table order and constraints may not be valid for execution.
-- テーブルの順序や制約は、実行には不正確な場合があります。

-- テーブル: asset_details (資産詳細)
-- 政治団体の資産（土地、建物、預金など）に関する詳細情報を格納します。
CREATE TABLE public.asset_details (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- 資産詳細レコードの一意なID (UUID)
 organization_report_id text NOT NULL, -- 関連する政治団体の報告書ID (political_organizations.report_idへの外部キー)
 asset_type text, -- 資産の種類（例: 「土地」「建物」「預金」）
 description text, -- 資産の詳細な説明
 value bigint, -- 資産の価値（金額）
 acquisition_date date, -- 資産の取得日
 remarks text, -- 備考欄
 source_document_page text, -- 元の報告書PDF内でのページ番号
 created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード作成日時 (UTC)
 updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード更新日時 (UTC)
 CONSTRAINT asset_details_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT asset_details_organization_report_id_fkey FOREIGN KEY (organization_report_id) REFERENCES public.political_organizations(report_id) -- 外部キー制約
);

-- テーブル: audit_documents (監査文書)
-- 政治資金収支報告書に関連する監査文書（監査意見書など）の情報を格納します。
CREATE TABLE public.audit_documents (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- 監査文書レコードの一意なID (UUID)
 organization_report_id text NOT NULL, -- 関連する政治団体の報告書ID (political_organizations.report_idへの外部キー)
 document_type text, -- 監査文書の種類（例: 「監査意見書」）
 has_document boolean, -- 該当文書の有無
 auditor_name text, -- 監査人の氏名
 audit_date date, -- 監査日
 created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード作成日時 (UTC)
 updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード更新日時 (UTC)
 CONSTRAINT audit_documents_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT audit_documents_organization_report_id_fkey FOREIGN KEY (organization_report_id) REFERENCES public.political_organizations(report_id) -- 外部キー制約
);

-- テーブル: chat_messages (チャットメッセージ)
-- AIチャット機能におけるユーザーとアシスタントの対話履歴を格納します。
CREATE TABLE public.chat_messages (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- メッセージの一意なID (UUID)
 session_id uuid, -- このメッセージが属するチャットセッションのID (chat_sessions.idへの外部キー)
 message_type text NOT NULL CHECK (message_type = ANY (ARRAY['user'::text, 'assistant'::text])), -- メッセージの種別（'user' または 'assistant'）
 content text NOT NULL, -- メッセージの本文
 source_documents jsonb, -- アシスタントの回答が参照したソースドキュメントの情報 (JSONB形式)
 created_at timestamp with time zone DEFAULT now(), -- メッセージ作成日時
 CONSTRAINT chat_messages_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) -- 外部キー制約
);

-- テーブル: chat_sessions (チャットセッション)
-- AIチャット機能のセッション情報を管理します。
CREATE TABLE public.chat_sessions (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- チャットセッションの一意なID (UUID)
 session_name text NOT NULL, -- チャットセッションの名前
 created_at timestamp with time zone DEFAULT now(), -- セッション作成日時
 updated_at timestamp with time zone DEFAULT now(), -- セッション更新日時
 CONSTRAINT chat_sessions_pkey PRIMARY KEY (id) -- 主キー制約
);

-- テーブル: diet_members (国会議員)
-- 国会議員の基本情報を格納します。
CREATE TABLE public.diet_members (
 id integer NOT NULL DEFAULT nextval('diet_members_id_seq'::regclass), -- 議員の一意なID (連番)
 name text NOT NULL, -- 議員名
 party_id integer, -- 所属政党のID (political_parties.idへの外部キー)
 constituency text, -- 選挙区
 elected_at date, -- 当選日
 created_at timestamp without time zone DEFAULT now(), -- レコード作成日時
 CONSTRAINT diet_members_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT diet_members_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.political_parties(id) -- 外部キー制約
);

-- テーブル: document_embeddings (文書埋め込みベクトル)
-- PDF文書を分割したチャンク（断片）のテキストと、それに対応する埋め込みベクトルを格納します。セマンティック検索に使用されます。
CREATE TABLE public.document_embeddings (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- 埋め込みベクトルの一意なID (UUID)
 document_id uuid, -- 元となるPDF文書のID (pdf_documents.idへの外部キー)
 embedding_vector jsonb NOT NULL, -- テキストチャンクの埋め込みベクトル (JSONB形式)
 chunk_index integer DEFAULT 0, -- 文書内でのチャンクのインデックス番号
 chunk_text text, -- 埋め込みベクトル化された元のテキストチャンク
 created_at timestamp with time zone DEFAULT now(), -- レコード作成日時
 updated_at timestamp with time zone DEFAULT now(), -- レコード更新日時
 CONSTRAINT document_embeddings_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT document_embeddings_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.pdf_documents(id) -- 外部キー制約
);

-- テーブル: donations (寄付)
-- 寄付に関する詳細情報を格納します。
CREATE TABLE public.donations (
 id integer NOT NULL DEFAULT nextval('donations_id_seq'::regclass), -- 寄付の一意なID (連番)
 line_number integer, -- 報告書内での行番号
 donor_name text, -- 寄付者の氏名または名称
 amount integer, -- 寄付金額
 date date, -- 寄付日
 address text, -- 寄付者の住所
 occupation text, -- 寄付者の職業
 remarks text, -- 備考欄
 recipient_id integer, -- 受領者のID (recipients.idへの外部キー)
 CONSTRAINT donations_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT donations_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.recipients(id) -- 外部キー制約
);

-- テーブル: entities (エンティティ)
-- 金銭取引に関わる個人や団体などのエンティティ情報を汎用的に管理します。
CREATE TABLE public.entities (
 id integer NOT NULL DEFAULT nextval('entities_id_seq'::regclass), -- エンティティの一意なID (連番)
 name text NOT NULL, -- エンティティの名称
 entity_type text, -- エンティティの種類（例: 「個人」「法人」）
 address text, -- エンティティの住所
 created_at timestamp without time zone DEFAULT now(), -- レコード作成日時
 CONSTRAINT entities_pkey PRIMARY KEY (id) -- 主キー制約
);

-- テーブル: expenditure_details (支出詳細)
-- 政治団体の支出に関する詳細情報を格納します。
CREATE TABLE public.expenditure_details (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- 支出詳細レコードの一意なID (UUID)
 organization_report_id text NOT NULL, -- 関連する政治団体の報告書ID (political_organizations.report_idへの外部キー)
 category text, -- 支出の分類（例: 「人件費」「事務所費」）
 item_name text, -- 支出項目名
 purpose text, -- 支出の目的
 amount bigint, -- 支出額
 expenditure_date date, -- 支出日
 payee_name text, -- 支払先の氏名または名称
 payee_address text, -- 支払先の住所
 remarks text, -- 備考欄
 source_document_page text, -- 元の報告書PDF内でのページ番号
 created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード作成日時 (UTC)
 updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード更新日時 (UTC)
 CONSTRAINT expenditure_details_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT expenditure_details_organization_report_id_fkey FOREIGN KEY (organization_report_id) REFERENCES public.political_organizations(report_id) -- 外部キー制約
);

-- テーブル: financial_summaries (財務概要)
-- 政治団体の収支報告書の財務サマリー（収入、支出、繰越額など）を格納します。
CREATE TABLE public.financial_summaries (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- 財務概要レコードの一意なID (UUID)
 organization_report_id text NOT NULL, -- 関連する政治団体の報告書ID (political_organizations.report_idへの外部キー)
 prev_year_balance bigint, -- 前年からの繰越額
 current_year_revenue bigint, -- 本年の収入額
 total_revenue bigint, -- 収入総額 (繰越額 + 本年収入額)
 total_expenditure bigint, -- 支出総額
 next_year_balance bigint, -- 翌年への繰越額
 created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード作成日時 (UTC)
 updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード更新日時 (UTC)
 CONSTRAINT financial_summaries_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT financial_summaries_organization_report_id_fkey FOREIGN KEY (organization_report_id) REFERENCES public.political_organizations(report_id) -- 外部キー制約
);

-- テーブル: fund_flows (資金フロー)
-- 異なるエンティティ（団体や個人）間の資金の流れを記録します。
CREATE TABLE public.fund_flows (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- 資金フローレコードの一意なID (UUID)
 source_entity text NOT NULL, -- 資金の源泉エンティティ名
 target_entity text NOT NULL, -- 資金の対象エンティティ名
 amount bigint NOT NULL, -- 資金の移動額
 flow_date date NOT NULL, -- 資金の移動日
 flow_type text NOT NULL, -- フローの種類（例: 「寄付」「支出」）
 description text, -- フローに関する説明
 document_id uuid, -- 関連するPDF文書のID (pdf_documents.idへの外部キー)
 created_at timestamp with time zone DEFAULT now(), -- レコード作成日時
 CONSTRAINT fund_flows_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT fund_flows_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.pdf_documents(id) -- 外部キー制約
);

-- テーブル: fund_management_organizations (資金管理団体)
-- 政治家の資金管理団体の情報を格納します。
CREATE TABLE public.fund_management_organizations (
 id bigint NOT NULL DEFAULT nextval('fund_management_organizations_id_seq'::regclass), -- 資金管理団体の一意なID (連番)
 politician_id bigint NOT NULL, -- 関連する政治家のID (politicians.idへの外部キー)
 organization_name character varying NOT NULL, -- 団体名
 office_type character varying NOT NULL, -- 事務所の種類
 report_year integer NOT NULL, -- 報告年
 notified_date date, -- 届出日
 jurisdiction character varying NOT NULL DEFAULT '総務大臣'::character varying, -- 所管（例: 「総務大臣」「都道府県選挙管理委員会」）
 is_active boolean NOT NULL DEFAULT true, -- 現在活動中かどうかのフラグ
 created_at timestamp with time zone NOT NULL DEFAULT now(), -- レコード作成日時
 updated_at timestamp with time zone NOT NULL DEFAULT now(), -- レコード更新日時
 total_income numeric, -- 収入総額
 total_expenditure numeric, -- 支出総額
 net_balance numeric, -- 差引残高
 CONSTRAINT fund_management_organizations_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT fk_politician FOREIGN KEY (politician_id) REFERENCES public.politicians(id) -- 外部キー制約
);

-- テーブル: monitored_documents (監視対象文書)
-- 監視対象としている外部のウェブサイトや文書（ニュース記事など）の情報を格納します。
CREATE TABLE public.monitored_documents (
 id integer NOT NULL DEFAULT nextval('monitored_documents_id_seq'::regclass), -- 文書の一意なID (連番)
 title text NOT NULL, -- 文書のタイトル
 description text, -- 文書の説明
 url text, -- 文書のURL
 published_at date, -- 公開日
 created_at timestamp without time zone DEFAULT now(), -- レコード作成日時
 CONSTRAINT monitored_documents_pkey PRIMARY KEY (id) -- 主キー制約
);

-- テーブル: organizations (団体)
-- 政治団体に限らない、一般的な団体情報を格納します。
CREATE TABLE public.organizations (
 id integer NOT NULL DEFAULT nextval('organizations_id_seq'::regclass), -- 団体の一意なID (連番)
 name text NOT NULL, -- 団体名
 type text, -- 団体の種類
 address text, -- 団体の住所
 established_on date, -- 設立日
 created_at timestamp without time zone DEFAULT now(), -- レコード作成日時
 CONSTRAINT organizations_pkey PRIMARY KEY (id) -- 主キー制約
);

-- テーブル: party_branches (政党支部)
-- 政党の支部に関する情報を格納します。
CREATE TABLE public.party_branches (
 id integer NOT NULL DEFAULT nextval('party_branches_id_seq'::regclass), -- 支部の一意なID (連番)
 party_id integer, -- 所属する政党のID (political_parties.idへの外部キー)
 name text NOT NULL, -- 支部名
 representative_name text, -- 代表者名
 treasurer_name text, -- 会計責任者名
 branch_address text, -- 支部の住所
 registered_on date, -- 登録日
 created_at timestamp without time zone DEFAULT now(), -- レコード作成日時
 total_income numeric DEFAULT 0, -- 収入総額
 total_expenditure numeric DEFAULT 0, -- 支出総額
 net_balance numeric DEFAULT 0, -- 差引残高
 CONSTRAINT party_branches_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT party_branches_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.political_parties(id) -- 外部キー制約
);

-- テーブル: pdf_documents (PDF文書)
-- アップロードされた政治資金収支報告書等のPDFファイルのメタデータと処理ステータスを管理します。
CREATE TABLE public.pdf_documents (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- PDF文書の一意なID (UUID)
 file_name text NOT NULL, -- 元のファイル名
 blob_url text NOT NULL, -- ファイルが保存されているBlobストレージのURL
 upload_datetime timestamp with time zone DEFAULT now(), -- アップロード日時
 party_name text DEFAULT '不明'::text, -- 関連する政党名
 region text DEFAULT '不明'::text, -- 関連する地域（都道府県など）
 status text DEFAULT 'pending_upload'::text CHECK (status = ANY (ARRAY['pending_upload'::text, 'ocr_queued'::text, 'ocr_processing'::text, 'ocr_failed'::text, 'text_extraction_completed'::text, 'indexing_queued'::text, 'indexing_processing'::text, 'indexing_failed'::text, 'completed'::text])), -- 処理ステータス
 error_message text, -- 処理中に発生したエラーメッセージ
 file_size bigint, -- ファイルサイズ (バイト)
 groq_index_id text, -- Groq（検索エンジン等）のインデックスID
 created_at timestamp with time zone DEFAULT now(), -- レコード作成日時
 updated_at timestamp with time zone DEFAULT now(), -- レコード更新日時
 ocr_text text, -- OCRによって抽出された全文テキスト
 indexing_error_message text, -- インデックス作成時のエラーメッセージ
 file_hash character varying NOT NULL UNIQUE, -- ファイルのハッシュ値 (重複アップロード防止用)
 version integer NOT NULL DEFAULT 1, -- 文書のバージョン
 year integer, -- 報告書の対象年
 party_id integer, -- 関連する政党のID (political_parties.idへの外部キー)
 politician_id integer, -- 関連する政治家のID (politicians.idへの外部キー)
.CONSTRAINT pdf_documents_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT fk_pdf_documents_politician_id FOREIGN KEY (politician_id) REFERENCES public.politicians(id), -- 外部キー制約
 CONSTRAINT fk_pdf_documents_party_id FOREIGN KEY (party_id) REFERENCES public.political_parties(id) -- 外部キー制約
);

-- テーブル: political_funds (政治資金団体)
-- 資金管理団体を含む、政治資金団体の基本情報を格納します。
CREATE TABLE public.political_funds (
 id integer NOT NULL DEFAULT nextval('political_funds_id_seq'::regclass), -- 政治資金団体の一意なID (連番)
 name text NOT NULL, -- 団体名
 affiliated_party text, -- 所属・関連政党
 representative_name text, -- 代表者名
 treasurer_name text, -- 会計責任者名
 address text, -- 主たる事務所の所在地
 registered_on date, -- 登録日
 created_at timestamp without time zone DEFAULT now(), -- レコード作成日時
 total_income numeric DEFAULT 0, -- 収入総額
 total_expenditure numeric DEFAULT 0, -- 支出総額
 net_balance numeric DEFAULT 0, -- 差引残高
 representative_id integer, -- 代表者（政治家）のID (politicians.idへの外部キー)
 CONSTRAINT political_funds_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT fk_politician FOREIGN KEY (representative_id) REFERENCES public.politicians(id) -- 外部キー制約
);

-- テーブル: political_funds_organizations (政治資金団体と他団体の関連)
-- 政治資金団体と他の一般団体との関連性を定義する中間テーブルです。
CREATE TABLE public.political_funds_organizations (
 id integer NOT NULL DEFAULT nextval('political_funds_organizations_id_seq'::regclass), -- 関連の一意なID (連番)
 fund_id integer, -- 政治資金団体のID (political_funds.idへの外部キー)
 organization_id integer, -- 関連する団体のID (organizations.idへの外部キー)
 relationship text, -- 関係性（例: 「支援団体」「友好団体」）
 created_at timestamp without time zone DEFAULT now(), -- レコード作成日時
 CONSTRAINT political_funds_organizations_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT political_funds_organizations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id), -- 外部キー制約
 CONSTRAINT political_funds_organizations_fund_id_fkey FOREIGN KEY (fund_id) REFERENCES public.political_funds(id) -- 外部キー制約
);

-- テーブル: political_organizations (政治団体)
-- 収支報告書から抽出した政治団体の基本情報を格納します。各報告書に紐づくマスターデータとなります。
CREATE TABLE public.political_organizations (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- 団体レコードの一意なID (UUID)
 report_id text NOT NULL UNIQUE, -- 報告書に固有のID（例: 団体名+報告年）。他テーブルからの参照キーとなる。
 name text, -- 団体名
 address text, -- 主たる事務所の所在地
 representative_name text, -- 代表者名
 accountant_name text, -- 会計責任者名
 report_year integer, -- 報告書の対象年
 raw_ocr_text text, -- OCRで抽出した生のテキストデータ（解析元データとして保持）
 created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード作成日時 (UTC)
 updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード更新日時 (UTC)
 CONSTRAINT political_organizations_pkey PRIMARY KEY (id) -- 主キー制約
);

-- テーブル: political_parties (政党)
-- 政党（本部）の基本情報を格納します。
CREATE TABLE public.political_parties (
 id integer NOT NULL DEFAULT nextval('political_parties_id_seq'::regclass), -- 政党の一意なID (連番)
 name text NOT NULL, -- 政党名
 representative_name text, -- 代表者名
 treasurer_name text, -- 会計責任者名
 headquarters_address text, -- 本部の所在地
 established_on date, -- 設立日
 created_at timestamp without time zone DEFAULT now(), -- レコード作成日時
 total_income numeric DEFAULT 0, -- 収入総額
 total_expenditure numeric DEFAULT 0, -- 支出総額
 net_balance numeric DEFAULT 0, -- 差引残高
 CONSTRAINT political_parties_pkey PRIMARY KEY (id) -- 主キー制約
);

-- テーブル: politicians (政治家)
-- 政治家の詳細なプロフィール情報を格納します。
CREATE TABLE public.politicians (
 id integer NOT NULL DEFAULT nextval('politicians_id_seq'::regclass), -- 政治家の一意なID (連番)
 name text NOT NULL, -- 氏名
 party_id integer, -- 所属政党のID (political_parties.idへの外部キー)
 branch_id integer, -- 所属する政党支部のID (party_branches.idへの外部キー)
 elected_area text, -- 選挙区
 position text, -- 役職
 created_at timestamp without time zone DEFAULT now(), -- レコード作成日時
 total_donations bigint DEFAULT 0, -- この政治家に関連する寄付総額
 total_expenditures bigint DEFAULT 0, -- この政治家に関連する支出総額
 net_balance bigint DEFAULT (total_donations - total_expenditures), -- 差引残高
 last_updated timestamp without time zone DEFAULT now(), -- レコード最終更新日時
 legislature text, -- 所属議院（例: 「衆議院」「参議院」）
 profile_url text, -- プロフィールページのURL
 photo_url text, -- 顔写真のURL
 term_end_date date, -- 任期終了日
 election_years text, -- 当選年（複数ある場合はカンマ区切りなど）
 current_positions text, -- 現在の役職（複数）
 positions_as_of date, -- 役職情報の時点
 biography text, -- 経歴
 biography_as_of date, -- 経歴情報の時点
 external_id text, -- 外部システムで利用されるID
 status text DEFAULT 'active'::text, -- ステータス（例: 「active」（現職）、「retired」（引退））
 name_kana text, -- 氏名のフリガナ
 CONSTRAINT politicians_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT politicians_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.party_branches(id), -- 外部キー制約
 CONSTRAINT politicians_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.political_parties(id) -- 外部キー制約
);

-- テーブル: processing_jobs (処理ジョブ)
-- PDF文書に対するOCRやインデックス作成などの非同期処理ジョブを管理します。
CREATE TABLE public.processing_jobs (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- ジョブの一意なID (UUID)
 document_id uuid NOT NULL, -- 処理対象の文書ID (pdf_documents.idへの外部キー)
 job_type character varying NOT NULL CHECK (job_type::text = ANY (ARRAY['ocr'::character varying, 'indexing'::character varying, 'full_processing'::character varying]::text[])), -- ジョブの種類 ('ocr', 'indexing', 'full_processing')
 status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying]::text[])), -- ジョブのステータス
 priority integer NOT NULL DEFAULT 1, -- 優先度（数値が小さいほど高い）
 created_at timestamp with time zone DEFAULT now(), -- ジョブ作成日時
 started_at timestamp with time zone, -- ジョブ開始日時
 completed_at timestamp with time zone, -- ジョブ完了日時
 error_message text, -- 失敗時のエラーメッセージ
 retry_count integer NOT NULL DEFAULT 0, -- 現在のリトライ回数
 max_retries integer NOT NULL DEFAULT 3, -- 最大リトライ回数
 CONSTRAINT processing_jobs_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT processing_jobs_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.pdf_documents(id) -- 外部キー制約
);

-- テーブル: recipients (受領者)
-- 寄付の受領者情報を個別に管理します。
CREATE TABLE public.recipients (
 id integer NOT NULL DEFAULT nextval('recipients_id_seq'::regclass), -- 受領者の一意なID (連番)
 name text NOT NULL, -- 受領者の氏名または名称
 type text CHECK (type = ANY (ARRAY['個人'::text, '政党支部'::text, '政党本部'::text, 'その他'::text])), -- 受領者の種別
 party text, -- 所属政党（該当する場合）
 CONSTRAINT recipients_pkey PRIMARY KEY (id) -- 主キー制約
);

-- テーブル: revenue_details (収入詳細)
-- 政治団体の収入（寄付や事業収入など）に関する詳細情報を格納します。
CREATE TABLE public.revenue_details (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- 収入詳細レコードの一意なID (UUID)
 organization_report_id text NOT NULL, -- 関連する政治団体の報告書ID (political_organizations.report_idへの外部キー)
 category text, -- 収入の分類（例: 「個人からの寄付」「法人からの寄付」）
 item_name text, -- 収入項目名
 amount bigint, -- 収入額
 donor_name text, -- 寄付者の氏名または名称
 donor_address text, -- 寄付者の住所
 donor_occupation text, -- 寄付者の職業
 donation_date date, -- 寄付（収入）の日付
 remarks text, -- 備考欄
 source_document_page text, -- 元の報告書PDF内でのページ番号
 created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード作成日時 (UTC)
 updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()), -- レコード更新日時 (UTC)
 CONSTRAINT revenue_details_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT revenue_details_organization_report_id_fkey FOREIGN KEY (organization_report_id) REFERENCES public.political_organizations(report_id) -- 外部キー制約
);

-- テーブル: system_logs (システムログ)
-- システム全体の動作（バッチ処理、エラーなど）に関するログを記録します。
CREATE TABLE public.system_logs (
 id uuid NOT NULL DEFAULT gen_random_uuid(), -- ログの一意なID (UUID)
 process_id uuid, -- 関連するプロセスやジョブのID
 file_name text, -- 関連するファイル名
 step text, -- 処理のステップ名
 status text, -- ステータス（例: 「SUCCESS」「FAILURE」）
 message text, -- ログメッセージ
 error_stack text, -- エラー発生時のスタックトレース
 metadata jsonb, -- その他のメタデータ (JSONB形式)
 level character varying CHECK (level::text = ANY (ARRAY['INFO'::character varying, 'WARN'::character varying, 'ERROR'::character varying]::text[])), -- ログレベル
 "timestamp" timestamp with time zone DEFAULT now(), -- ログのタイムスタンプ
 created_at timestamp with time zone DEFAULT now(), -- レコード作成日時
 CONSTRAINT system_logs_pkey PRIMARY KEY (id) -- 主キー制約
);

-- テーブル: transactions (取引)
-- エンティティ間の金銭的な取引を汎用的に記録します。
CREATE TABLE public.transactions (
 id integer NOT NULL DEFAULT nextval('transactions_id_seq'::regclass), -- 取引の一意なID (連番)
 source_entity_id integer, -- 支払元エンティティのID (entities.idへの外部キー)
 target_entity_id integer, -- 支払先エンティティのID (entities.idへの外部キー)
 amount numeric, -- 取引額
 transaction_type text, -- 取引の種類（例: 「寄付」「融資」）
 occurred_on date, -- 取引発生日
 created_at timestamp without time zone DEFAULT now(), -- レコード作成日時
 CONSTRAINT transactions_pkey PRIMARY KEY (id), -- 主キー制約
 CONSTRAINT transactions_target_entity_id_fkey FOREIGN KEY (target_entity_id) REFERENCES public.entities(id), -- 外部キー制約
 CONSTRAINT transactions_source_entity_id_fkey FOREIGN KEY (source_entity_id) REFERENCES public.entities(id) -- 外部キー制約
);
```
---

# PDF処理システム仕様書

## 1. 概要

本システムは、PDFドキュメントのアップロード、管理、テキスト抽出、構造化解析（Groq API利用）、データベースへの格納、およびRAG（Retrieval-Augmented Generation）アプリケーション用のベクトルデータ生成までを一貫して行うためのものです。特に、政治資金収支報告書のような定型フォーマットのPDF処理を効率化し、分析可能なデータとして蓄積することを目的としています。

## 2. アーキテクチャ概要

### 2.1. 主要コンポーネント

- **フロントエンド**: Next.js (App Router) と shadcn/ui を使用した管理画面 (`/pdf-manager`)。
- **APIサーバー**: Next.js API Routes。PDF操作、バッチ処理トリガー、チャット機能を提供。
- **データベース**: Supabase PostgreSQL。Prisma ORM を介してアクセス。
- **Blobストレージ**: Vercel Blob。アップロードされたPDFファイルの永続化。
- **AIサービス**:

- Groq API: テキストの構造化解析。
- OpenAI API (または互換API): テキストのベクトル化（将来的な実装）。



- **バッチ処理**: Vercel Cron Jobs と専用APIエンドポイントによる非同期処理。


### 2.2. データフロー

1. **PDFアップロード**:

1. ユーザーが管理画面からPDFをアップロード (`/api/pdf-manager/upload`)。
2. ファイルはVercel Blobに保存され、メタデータ（ファイル名、Blob URL、初期ステータスなど）が`PdfDocument`テーブルに記録される。



2. **同期・キューイング (バッチ処理起点)**:

1. `scripts/sync-and-queue.ts` を実行（手動または専用API経由）。
2. 指定されたCSVファイル (`SEIJI_SHIKIN_CSV_URL` 環境変数で指定) を読み込み、DBに未登録のPDF情報を`PdfDocument`テーブルに `pending_upload` ステータスで登録。



3. **非同期バッチ処理 (Cron Job)**:

1. Vercel Cron Jobが定期的に `/api/cron/process-queue` を呼び出す。
2. APIは処理待ちの`PdfDocument`を少量取得し、`lib/pipeline/processor.ts` の `processSingleDocument` 関数を実行。
3. `processSingleDocument` の処理内容:

1. ステータスを `processing_pipeline` に更新。
2. BlobからPDFをダウンロード。
3. ファイルハッシュを計算し、`PdfDocument`に保存。重複チェックも行う。
4. `pdf-parse` を使用してPDFからテキストを抽出 (`ocr_text` に保存)。ステータス更新。
5. 抽出テキストをGroq APIに送信し、構造化データ（JSON）を取得。

1. **現状**: 取得したJSONの具体的なDBテーブルへのマッピング・保存は未実装。`processor.ts` 内にコメントアウトで将来的な実装箇所を示唆。



6. 抽出テキストをチャンク分割。
7. 各チャンクをベクトル化 (現状はダミーのベクトル生成)。
8. ベクトルデータを `DocumentEmbedding` テーブルに保存。
9. 最終ステータスを `completed` またはエラーに応じて `*_failed` に更新。






4. **データ活用**:

1. 管理画面でPDF情報と処理ステータスを閲覧・管理。
2. `/api/pdf-manager/chat` エンドポイントで、`DocumentEmbedding` を利用したRAGチャット。





## 3. データベーススキーマ (主要テーブル)

### 3.1. `PdfDocument` テーブル

PDFファイル自体のメタデータと処理ステータスを管理。

| カラム名 | 型 | 説明
|-----|-----|-----
| `id` | `String` | UUID (主キー)
| `file_name` | `String` | 元のファイル名
| `blob_url` | `String` | Vercel Blob上のURL (UNIQUE)
| `upload_datetime` | `DateTime?` | アップロード日時 (デフォルト: `now()`)
| `party_name` | `String?` | 政党名 (デフォルト: "不明")
| `region` | `String?` | 地域 (デフォルト: "不明")
| `status` | `PdfDocumentStatus?` | 処理ステータス (Enum, デフォルト: `pending_upload`)
| `error_message` | `String?` | エラー発生時のメッセージ
| `file_size` | `BigInt?` | ファイルサイズ (バイト)
| `groq_index_id` | `String?` | Groq解析結果のID (具体的な用途は未定義)
| `created_at` | `DateTime?` | レコード作成日時 (デフォルト: `now()`)
| `updated_at` | `DateTime?` | レコード更新日時 (`@updatedAt`)
| `ocr_text` | `String?` | PDFから抽出された生テキスト
| `indexing_error_message` | `String?` | インデックス作成時のエラーメッセージ
| `file_hash` | `String` | ファイル内容のSHA-256ハッシュ (UNIQUE)
| `version` | `Int` | ドキュメントバージョン (デフォルト: 1)
| `year` | `Int?` | 報告年 (ファイル名などから抽出想定)
| `party_id` | `Int?` | `PoliticalParty`テーブルへの外部キー (FK)
| `politician_id` | `Int?` | `Politician`テーブルへの外部キー (FK)
| `political_organization_id` | `String?` | `PoliticalOrganization`テーブルへの外部キー (FK, Prismaスキーマで追加)


### 3.2. `DocumentEmbedding` テーブル

抽出されたテキストチャンクとそのベクトル表現を格納。

| カラム名 | 型 | 説明
|-----|-----|-----
| `id` | `String` | UUID (主キー)
| `document_id` | `String?` | `PdfDocument`のID (FK)
| `embedding_vector` | `Json` | テキストチャンクのベクトルデータ (pgvectorの`vector`型想定)
| `chunk_index` | `Int?` | ドキュメント内のチャンクのインデックス
| `chunk_text` | `String?` | テキストチャンクの内容
| `created_at` | `DateTime?` | レコード作成日時
| `updated_at` | `DateTime?` | レコード更新日時


### 3.3. `PdfDocumentStatus` Enum

PDFの処理状態を示す。

- `pending_upload`: アップロード直後、または同期スクリプトによる初期登録状態。
- `duplicate`: ファイルハッシュに基づき重複と判定された状態。
- `processing_pipeline`: バッチ処理パイプラインによる処理中。
- `text_extraction_processing`: テキスト抽出処理中。
- `text_extraction_completed`: テキスト抽出完了。
- `text_extraction_failed`: テキスト抽出失敗。
- `indexing_queued`: インデックス作成待ち（現在は直接使用せず、`text_extraction_completed`から`indexing_processing`へ）。
- `indexing_processing`: チャンク化・ベクトル化処理中。
- `indexing_failed`: インデックス作成失敗。
- `completed`: 全ての処理が正常に完了。


### 3.4. `PoliticalOrganization` および関連テーブル

Groqによる構造化解析結果を格納するためのテーブル群（`AssetDetail`, `AuditDocument`, `ExpenditureDetail`, `FinancialSummary`, `RevenueDetail`など）。これらのテーブルへの具体的なデータマッピングと保存ロジックは、`lib/pipeline/processor.ts`内で現在コメントアウトされており、将来的な実装項目です。

## 4. APIエンドポイント仕様

ベースパス: `/api`

### 4.1. PDFアップロード

- **エンドポイント**: `POST /pdf-manager/upload`
- **リクエスト**: `FormData` (`file`: アップロードするPDFファイル)
- **レスポンス (成功時)**: `201 Created`

```json
{
  "success": true,
  "document": { /* PdfDocumentオブジェクト */ },
  "message": "ファイルが正常にアップロードされました"
}
```


- **処理内容**:

1. ファイルバリデーション（PDF形式、サイズ制限）。
2. Vercel Blobへファイルをアップロード。
3. `PdfDocument`テーブルにメタデータを保存（初期ステータス: `pending_upload`または`pending_hash_check`）。





### 4.2. PDF一覧取得

- **エンドポイント**: `GET /pdf-manager/documents`
- **クエリパラメータ**:

- `page` (数値, オプション): ページ番号 (デフォルト: 1)
- `limit` (数値, オプション): 1ページあたりのアイテム数 (デフォルト: 10 or 20)
- `status` (文字列, オプション): `PdfDocumentStatus` Enumの値でフィルタリング
- `party` (文字列, オプション): 政党名でフィルタリング
- `region` (文字列, オプション): 地域でフィルタリング
- `name` (文字列, オプション): ファイル名で部分一致フィルタリング (API側での実装が必要)



- **レスポンス (成功時)**: `200 OK`

```json
{
  "documents": [ /* PdfDocumentオブジェクトの配列 */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```


- **処理内容**: `PdfDocument`テーブルから条件に合うドキュメントをページネーション付きで取得。


### 4.3. 個別PDFインデックス作成 (テキスト抽出含む)

- **エンドポイント**: `POST /pdf-manager/documents/index`
- **リクエストボディ**:

```json
{
  "documentIds": ["uuid1", "uuid2", ...]
}
```


- **レスポンス (成功時)**: `200 OK`

```json
{
  "success": true,
  "results": [
    { "documentId": "uuid1", "success": true, "indexId": "index_uuid1_timestamp" },
    { "documentId": "uuid2", "success": false, "error": "エラーメッセージ" }
  ],
  "message": "N件のドキュメントのインデックス処理リクエストを受け付けました。"
}
```


- **処理内容**:

1. 指定された各`documentId`について処理。
2. `PdfDocument`の`ocr_text`が未抽出の場合、BlobからPDFをダウンロードしテキスト抽出。結果を`ocr_text`に保存、ステータス更新。
3. ファイルハッシュを計算し、重複チェック。重複時はステータスを`duplicate`に更新。
4. テキスト抽出成功後、テキストをチャンク分割。
5. 各チャンクをベクトル化（現状はダミー）。
6. ベクトルデータを`DocumentEmbedding`テーブルに保存。
7. `PdfDocument`のステータスを`completed`またはエラーに応じて更新。





### 4.4. RAGチャット

- **エンドポイント**: `POST /pdf-manager/chat`
- **リクエストボディ**:

```json
{
  "messages": [ /* AI SDK CoreMessageオブジェクトの配列 */ ],
  "sessionId": "optional-session-uuid"
}
```


- **レスポンス (成功時)**: AI SDK `StreamingTextResponse`
- **処理内容**:

1. ユーザーの最新メッセージを取得。
2. メッセージをベクトル化（`getQueryEmbedding`、現状ダミー）。
3. `DocumentEmbedding`テーブルから類似ベクトルを持つチャンクを検索（`findRelevantChunks`、現状ダミー）。
4. 検索結果をコンテキストとして、OpenAI API (gpt-4o) にプロンプトを送信。
5. 結果をストリーミングで返し、チャット履歴を`ChatSession`, `ChatMessage`テーブルに保存。





### 4.5. Cron Job用キュー処理API

- **エンドポイント**: `GET /api/cron/process-queue`
- **認証**: `Authorization: Bearer ${CRON_SECRET}` ヘッダーが必要。
- **レスポンス (成功時)**: `200 OK`

```json
{
  "success": true,
  "results": [ /* 各ドキュメントの処理結果オブジェクトの配列 */ ]
  // または "message": "No documents to process."
}
```


- **処理内容**:

1. `PdfDocument`テーブルから処理待ちのドキュメントを少量取得（例: `status`が`pending_upload`, `text_extraction_failed`, `indexing_failed`のもの）。
2. 取得した各ドキュメントIDに対して `lib/pipeline/processor.ts` の `processSingleDocument` を呼び出し、フルパイプライン処理を実行。





## 5. 主要な処理ロジック詳細

### 5.1. テキスト抽出

- ライブラリ: `pdf-parse`
- 処理: BlobからダウンロードしたPDFファイルのバッファを`pdf-parse`に渡し、テキストコンテンツを取得。


### 5.2. Groqによる構造化解析

- サービス: Groq API (Model: `llama3-70b-8192`)
- プロンプト: 政治資金収支報告書のフォーマットを意識したシステムプロンプトと、OCRテキストをユーザーメッセージとして送信。JSON形式での出力を要求。
- **現状の課題**: 解析結果のJSONを具体的なDBテーブル（`PoliticalOrganization`等）にマッピングし、永続化するロジックは未実装。`lib/pipeline/processor.ts`内の`// ... logic to upsert into political_organizations, financial_summaries, etc.`部分が該当。


### 5.3. チャンク分割とベクトル化

- チャンク分割: `splitTextIntoChunks`関数。固定サイズ（例: 1000文字）とオーバーラップ（例: 100文字）でテキストを分割。
- ベクトル化: `generateEmbeddingsForChunks`関数。現状はダミーベクトルを生成。将来的にはOpenAI Embeddings API等を利用。


### 5.4. 重複チェック

- 方法: PDFファイル内容のSHA-256ハッシュ値を計算。
- タイミング:

- 個別インデックス作成時 (`/api/pdf-manager/documents/index`)。
- `sync-from-blob` APIによる新規登録時。
- アップロードAPI (`/api/pdf-manager/upload`) でも将来的には実装推奨。



- 処理: 計算したハッシュ値が`PdfDocument`テーブルの`file_hash`カラムに既に存在する場合、ステータスを`duplicate`に更新。


## 6. フロントエンド機能 (`app/pdf-manager/page.tsx`)

- **PDF一覧表示**:

- `DataTable`コンポーネントを使用。
- 表示項目: ファイル名、ステータス、アップロード日時、政党名、地域、ファイルサイズ、ハッシュ値。
- ページネーション。



- **フィルタリング**:

- ファイル名（部分一致）、ステータスによる絞り込みUI。API連携は一部実装。



- **PDFアップロード**:

- `PdfUploadForm`コンポーネント。ファイル選択、進捗表示、アップロード実行。



- **個別アクション**:

- 各PDF行にドロップダウンメニュー。
- 「インデックス作成」: `/api/pdf-manager/documents/index`を呼び出し。
- 「ドキュメントIDコピー」、「ファイルを開く」。



- **Blobストレージと同期 (新規追加想定)**:

- テキストエリアにBlob URLリストを貼り付け、「同期実行」ボタンで`/api/pdf-manager/documents/sync-from-blob`を呼び出すUI (前回の会話で作成)。





## 7. バッチ処理パイプライン

### 7.1. 同期・キューイングスクリプト (`scripts/sync-and-queue.ts`)

- 役割: 指定されたCSVファイル（政治資金PDFのリスト）を読み込み、DBに未登録のPDF情報を`PdfDocument`テーブルに初期ステータスで登録（キューイング）。
- 実行: 手動実行（`pnpm run script scripts/sync-and-queue.ts`）または専用APIエンドポイントからトリガー。
- 前提: CSV内のファイル名からBlob URLを構築できること。`SEIJI_SHIKIN_CSV_URL`環境変数でCSVの場所を指定。


### 7.2. Cron Jobによる非同期処理

- トリガー: Vercel Cron Jobが設定されたスケジュール（例: `* * * * *` で毎分）で`/api/cron/process-queue`をGETリクエスト。
- 処理: APIは処理待ちのドキュメントを少量取得し、`processSingleDocument`関数で1件ずつ処理。
- 目的: 長時間実行される可能性のある処理を、サーバーレス関数の実行時間制限内で分割実行し、システム全体のスループットを確保。


## 8. 主要な環境変数

- `DATABASE_URL` / `POSTGRES_PRISMA_URL`: Prismaが使用するSupabase PostgreSQLの接続URL。
- `POSTGRES_URL_NON_POOLING`: Prismaマイグレーション用などの直接接続URL。
- `GROQ_API_KEY`: Groq APIの認証キー。
- `CRON_SECRET`: Cron Job APIの認証用シークレットキー。
- `SEIJI_SHIKIN_CSV_URL`: `sync-and-queue.ts`スクリプトが参照するPDFリストCSVのURL。
- `BLOB_READ_WRITE_TOKEN`: Vercel Blobへのアクセス用トークン (通常Vercelが自動設定)。
- (将来的に) `OPENAI_API_KEY`: OpenAI Embeddings API用。


## 9. 今後の拡張性・課題

- **Groq解析結果のDB保存**: `lib/pipeline/processor.ts`内の構造化データ（政治資金収支報告書の詳細項目）を、`PoliticalOrganization`および関連テーブルへマッピングし保存するロジックの実装。
- **高度なエラーハンドリングとリトライ**: バッチ処理中の個別エラーに対するリトライ機構、エラー原因の詳細なロギング。
- **ベクトル化処理の本格実装**: `generateEmbeddingsForChunks`に実際のベクトル化API（OpenAIなど）呼び出しを実装。
- **管理画面の機能強化**:

- 一括アクション（複数PDF選択してインデックス作成、削除など）。
- より詳細なフィルタリング・ソートオプション。
- 処理進捗のリアルタイム表示。



- **Blobストレージの全自動スキャン**: Vercel Blob APIの`list()`機能の制限（最大1000件、ページネーション）を考慮しつつ、DBとBlobストレージ間の差分をより自動的に検出する仕組みの検討。
- **セキュリティ**: APIエンドポイントの認証・認可強化。
- **パフォーマンス**: 大量データ処理時のDBクエリ最適化、API応答速度の改善。


---

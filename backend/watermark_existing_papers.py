"""
One-time migration: some of Dr. Bora's papers already had their PDFs
manually dropped into uploads/paper/ (with their original filenames),
bypassing the admin upload flow entirely - so they were never watermarked
and aren't linked to a paper row's pdf_url, meaning GET /papers/{id}/pdf
can't serve them and the frontend won't show a PDF button for them.

This script finds those files, copies each into the UUID-named convention
add_watermark()/get_paper_pdf() expect, watermarks it, and sets pdf_url on
the matching paper (matched by exact title).

Run once from the backend/ directory, after seed_papers.py:
    python watermark_existing_papers.py

Safe to re-run: skips any paper that already has a pdf_url set, and skips
any file it can't find a match for (reports both at the end).

Matching is done by filename PREFIX rather than exact name, since a couple
of the original filenames referenced in the old frontend array were long
enough that they may have been display-truncated - as long as the real file
on disk starts with the given prefix, it'll be picked up.
"""

import os
import shutil
import uuid

from database import SessionLocal
from models import Paper
from routers.papers import add_watermark, UPLOAD_DIR

# filename prefix (as it appeared, possibly truncated, in the old frontend
# pdfUrl paths) -> exact paper title to match against in the database
RAW_FILE_PREFIX_TO_TITLE = {
    "Cinema_As_A_Tool_For_Health_And_Risk_Com":
        "Cinema as a tool for health and risk communication: Issues and challenges",
    "Assamese_Cinema_Through_Nine_Decades_Cha":
        "Assamese cinema through nine decades: Challenging journey with encouraging trend (Principal Author)",
    "Health_Communication_for_COVID19_and_be":
        "Health communication for COVID-19 and beyond: Exploring newer horizons",
    "Education_During_Covid19_And Beyond_Tran":
        "Education during COVID-19 and beyond: Transition from face-to-face to Blended learning",
    "Challenges_of_Fake_News_Mis_information":
        "Challenges of fake news: Mis-information, disinformation, malinformation in an increasingly-networked human world (Principal Author)",
    "Media_planning_for_communicating_science":
        "Media planning for communicating science",
    "Understanding_Science_Communication_":
        "Understanding Science communication in current context",
    "National_Education_Policy_2020_The_polic":
        "National Education Policy – 2020: The policy with futuristic vision",
    "COMMUNICATION_AND_MEDIA_TEACHING_AND_EDU":
        "Communication and media: teaching and education – exploring the synergy",
    "Health_information_dissemination_Directi":
        "Health Information Dissemination: Directions from COVID-19 and Thereafter",
    "ODL_in_North_Eastern_Region_perspectives":
        "ODL in North-Eastern Region – Perspectives, and Challenges",
    "Reviewing_literature_for_C4D":
        "Reviewing Literature for C4D",
    "Radio_The_evergreen_medium":
        "Radio – The Evergreen Medium",
    "Why_Development_Journalism_and_Journalism":
        "Why Development Journalism and Journalism Ethics",
}

WATERMARK_TEXT = "Dr. Abhijit Bora | abhijit.bora@tezpuruniversity.ac.in"


def find_file_for_prefix(prefix: str) -> str | None:
    if not os.path.isdir(UPLOAD_DIR):
        return None
    for filename in os.listdir(UPLOAD_DIR):
        if filename.startswith(prefix) and filename.lower().endswith(".pdf"):
            return filename
    return None


def migrate():
    db = SessionLocal()
    matched, already_linked = [], []
    missing_files, missing_papers = [], []

    try:
        for prefix, title in RAW_FILE_PREFIX_TO_TITLE.items():
            filename = find_file_for_prefix(prefix)
            if not filename:
                missing_files.append(prefix)
                continue

            paper = db.query(Paper).filter(Paper.title == title).first()
            if not paper:
                missing_papers.append(title)
                continue

            if paper.pdf_url:
                already_linked.append(title)
                continue

            src_path = os.path.join(UPLOAD_DIR, filename)
            unique_name = f"{uuid.uuid4()}.pdf"
            dest_path = os.path.join(UPLOAD_DIR, unique_name)
            shutil.copyfile(src_path, dest_path)

            watermarked_name = unique_name.replace(".pdf", "_watermarked.pdf")
            watermarked_path = os.path.join(UPLOAD_DIR, watermarked_name)
            add_watermark(dest_path, watermarked_path, WATERMARK_TEXT)

            paper.pdf_url = dest_path
            matched.append(title)

        db.commit()

        print(f"Watermarked and linked {len(matched)} paper(s):")
        for t in matched:
            print(" -", t)

        if already_linked:
            print(f"\nSkipped {len(already_linked)} paper(s) that already had a pdf_url:")
            for t in already_linked:
                print(" -", t)

        if missing_files:
            print(f"\nNo file found in {UPLOAD_DIR}/ for these (check the file is actually there):")
            for p in missing_files:
                print(" -", p, "*")

        if missing_papers:
            print(f"\nNo matching paper title found in the database for:")
            for t in missing_papers:
                print(" -", t)
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
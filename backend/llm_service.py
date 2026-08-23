import google.generativeai as genai
import os
import json
import re

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set.")

genai.configure(
    api_key=api_key
)

model = genai.GenerativeModel(
    "gemini-3.6-flash"
)


def clean_json_response(text):
    text = text.strip()

    text = re.sub(
        r"^```json\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"^```\s*",
        "",
        text
    )

    text = re.sub(
        r"\s*```$",
        "",
        text
    )

    return text.strip()


def parse_json_response(text):
    text = clean_json_response(text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(
            r"\{.*\}",
            text,
            re.DOTALL
        )

        if not match:
            raise ValueError(
                "Gemini did not return valid JSON."
            )

        return json.loads(
            match.group(0)
        )


def extract_jd_requirements(job_description):

    prompt = f"""
You are an expert Applicant Tracking System and recruitment requirements extraction system.

Analyze ONLY the following Job Description.

JOB DESCRIPTION:

{job_description}

Extract the requirements that are actually present in the Job Description.

Divide them into exactly these four categories:

1. Academic
2. Technical
3. Soft Skills
4. Behavioral

Academic requirements may include:

- Degree
- Branch
- Graduation year
- CGPA
- Eligibility

Technical requirements may include:

- Programming languages
- Frameworks
- Databases
- Tools
- Coding ability
- Software development
- Testing
- Technical technologies

Soft skills may include:

- Communication
- Interpersonal skills
- Teamwork
- Collaboration
- Leadership
- Presentation skills

Behavioral requirements may include:

- Self starter
- Motivation
- Problem solving
- Positive attitude
- Flexibility
- Adaptability
- Working under pressure
- Working in fast-paced environments

Important rules:

Only extract requirements explicitly stated or clearly required by the Job Description.

Do not invent requirements.

Do not add generic requirements that are not present in the Job Description.

Preserve the meaning of the original Job Description.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "academic": [],
    "technical": [],
    "soft_skills": [],
    "behavioral": []
}}

Return valid JSON only.
"""

    response = model.generate_content(
        prompt
    )

    result = parse_json_response(
        response.text
    )

    for category in [
        "academic",
        "technical",
        "soft_skills",
        "behavioral"
    ]:
        if category not in result:
            result[category] = []

        if not isinstance(
            result[category],
            list
        ):
            result[category] = [
                result[category]
            ]

    return result


def analyze_resume(
    resume_text,
    jd_requirements
):

    prompt = f"""
You are an expert Applicant Tracking System and professional recruitment screening system.

Your task is to analyze ONE candidate resume against a FIXED set of Job Description requirements.

The Job Description requirements have already been extracted.

You MUST use exactly these requirements.

Do NOT extract new requirements.

Do NOT modify the requirements.

Do NOT invent requirements.

JOB DESCRIPTION REQUIREMENTS:

{json.dumps(jd_requirements, indent=2)}

RESUME:

{resume_text}

First extract the candidate's information from the resume.

Extract only information that is actually present in the resume.

Do not invent information.

Extract:

1. Candidate name
2. Education
3. Skills
4. Work experience
5. Projects
6. Certifications

Then compare the candidate against the FIXED Job Description requirements.

Academic requirements must be checked against the actual resume.

Technical requirements may be matched using direct evidence or strong reasonable evidence.

For example, if the requirement is strong coding skills and the resume contains Java, Python, Data Structures and Algorithms and software development projects, consider the requirement matched.

Do not assume soft skills are present without evidence.

Do not assume communication skills merely because the candidate has projects, certifications or a degree.

Do not assume interpersonal skills merely because the candidate has teamwork-related experience unless there is evidence.

A requirement is MATCHED when the resume directly mentions it or provides strong reasonable evidence.

A requirement is MISSING when the requirement exists in the Job Description and the resume provides insufficient evidence.

Every matched or missing item MUST come from the supplied Job Description requirements.

Do not invent new requirements.

Do not list resume skills that are unrelated to the Job Description.

Calculate a realistic match score from 0 to 10.

The score must consider:

- Academic requirements
- Technical requirements
- Soft skills
- Behavioral requirements
- Overall suitability

Do not automatically give 10/10 because academic requirements are satisfied.

The shortlist decision should consider important mandatory requirements and overall suitability.

Return "Yes" if the candidate satisfies important mandatory requirements and is reasonably suitable.

Return "No" if important mandatory requirements are not satisfied.

Do not reject a candidate only because one soft skill is not explicitly written in the resume when the candidate otherwise strongly satisfies the role.

Give a concise professional justification.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "candidate": {{
        "name": "",
        "education": [],
        "skills": [],
        "experience": [],
        "projects": [],
        "certifications": []
    }},
    "match_score": 0,
    "requirements": {{
        "academic": {{
            "matched": [],
            "missing": []
        }},
        "technical": {{
            "matched": [],
            "missing": []
        }},
        "soft_skills": {{
            "matched": [],
            "missing": []
        }},
        "behavioral": {{
            "matched": [],
            "missing": []
        }}
    }},
    "shortlist": "Yes",
    "justification": ""
}}

Rules:

match_score must be a number from 0 to 10.

shortlist must be exactly "Yes" or "No".

matched arrays must contain only requirements from the supplied Job Description requirements.

missing arrays must contain only requirements from the supplied Job Description requirements.

Do not invent requirements.

Do not invent resume evidence.

Candidate information must come only from the resume.

Keep the justification concise.

Return valid JSON only.
"""

    response = model.generate_content(
        prompt
    )

    result = parse_json_response(
        response.text
    )

    if "candidate" not in result:
        result["candidate"] = {}

    candidate = result["candidate"]

    candidate_fields = [
        "name",
        "education",
        "skills",
        "experience",
        "projects",
        "certifications"
    ]

    for field in candidate_fields:

        if field not in candidate:
            candidate[field] = ""

        if field != "name" and not isinstance(
            candidate[field],
            list
        ):
            candidate[field] = [
                candidate[field]
            ]

    if "match_score" not in result:
        result["match_score"] = 0

    try:
        result["match_score"] = float(
            result["match_score"]
        )
    except:
        result["match_score"] = 0

    if result["match_score"] < 0:
        result["match_score"] = 0

    if result["match_score"] > 10:
        result["match_score"] = 10

    if "requirements" not in result:
        result["requirements"] = {}

    requirements = result["requirements"]

    for category in [
        "academic",
        "technical",
        "soft_skills",
        "behavioral"
    ]:

        if category not in requirements:
            requirements[category] = {
                "matched": [],
                "missing": []
            }

        if "matched" not in requirements[category]:
            requirements[category]["matched"] = []

        if "missing" not in requirements[category]:
            requirements[category]["missing"] = []

    if result.get("shortlist") not in [
        "Yes",
        "No"
    ]:
        result["shortlist"] = "No"

    if "justification" not in result:
        result["justification"] = ""

    return result